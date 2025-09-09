const { esClient, PRODUCTS_INDEX } = require('../config/elasticsearch');
const Fuse = require('fuse.js');
const Product = require('../models/product');

const elasticSearchService = {
  // Tìm kiếm fuzzy với Elasticsearch
  async fuzzySearch(options = {}) {
    try {
      const {
        query = '',
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        categoryId,
        minPrice,
        maxPrice,
        minRating,
        maxRating,
        hasDiscount = false,
        inStock = true,
        minViewCount,
        tags = []
      } = options;

      const from = (page - 1) * limit;

      // Build Elasticsearch query
      const esQuery = {
        bool: {
          must: [],
          filter: [],
          should: [],
          minimum_should_match: 0
        }
      };

      // Base filters
      esQuery.bool.filter.push({ term: { isActive: true } });

      if (inStock) {
        esQuery.bool.filter.push({ range: { stock: { gt: 0 } } });
      }

      // Text search với fuzzy matching
      if (query && query.trim()) {
        esQuery.bool.must.push({
          multi_match: {
            query: query.trim(),
            fields: [
              'name^3',           // Tên sản phẩm có độ ưu tiên cao nhất
              'description^2',    // Mô tả có độ ưu tiên trung bình
              'tags^2',          // Tags có độ ưu tiên trung bình
              'categoryName^1.5', // Tên danh mục có độ ưu tiên thấp hơn
              'searchText^1'      // Text tổng hợp có độ ưu tiên thấp nhất
            ],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'or'
          }
        });

        // Thêm phrase matching để ưu tiên kết quả chính xác hơn
        esQuery.bool.should.push({
          multi_match: {
            query: query.trim(),
            fields: ['name^5', 'description^3'],
            type: 'phrase',
            boost: 2
          }
        });

        // Thêm prefix matching cho autocomplete
        esQuery.bool.should.push({
          multi_match: {
            query: query.trim(),
            fields: ['name.keyword^3', 'tags.keyword^2'],
            type: 'phrase_prefix'
          }
        });
      }

      // Category filter
      if (categoryId) {
        esQuery.bool.filter.push({ term: { categoryId } });
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        const priceRange = {};
        if (minPrice !== undefined) priceRange.gte = minPrice;
        if (maxPrice !== undefined) priceRange.lte = maxPrice;
        esQuery.bool.filter.push({ range: { price: priceRange } });
      }

      // Rating filter
      if (minRating !== undefined || maxRating !== undefined) {
        const ratingRange = {};
        if (minRating !== undefined) ratingRange.gte = minRating;
        if (maxRating !== undefined) ratingRange.lte = maxRating;
        esQuery.bool.filter.push({ range: { rating: ratingRange } });
      }

      // Discount filter
      if (hasDiscount) {
        esQuery.bool.filter.push({ range: { discountPercentage: { gt: 0 } } });
      }

      // View count filter
      if (minViewCount !== undefined) {
        esQuery.bool.filter.push({ range: { viewCount: { gte: minViewCount } } });
      }

      // Tags filter
      if (tags.length > 0) {
        esQuery.bool.filter.push({ terms: { 'tags.keyword': tags } });
      }

      // Sort options
      const sort = [];
      if (query && query.trim()) {
        sort.push('_score'); // Ưu tiên score khi có search query
      }

      switch (sortBy) {
        case 'price':
          sort.push({ price: { order: sortOrder } });
          break;
        case 'rating':
          sort.push({ rating: { order: sortOrder } });
          break;
        case 'name':
          sort.push({ 'name.keyword': { order: sortOrder } });
          break;
        case 'viewCount':
          sort.push({ viewCount: { order: sortOrder } });
          break;
        case 'createdAt':
        default:
          sort.push({ createdAt: { order: sortOrder } });
          break;
      }

      // Execute search
      const response = await esClient.search({
        index: PRODUCTS_INDEX,
        body: {
          query: esQuery,
          sort,
          from,
          size: limit,
          highlight: {
            fields: {
              name: {},
              description: {},
              tags: {}
            }
          }
        }
      });

      const hits = response.body.hits;
      const totalHits = hits.total.value;
      const products = hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
        _score: hit._score,
        highlight: hit.highlight
      }));

      const totalPages = Math.ceil(totalHits / limit);

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts: totalHits,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          },
          searchInfo: {
            query: query.trim(),
            totalHits,
            maxScore: hits.max_score
          }
        }
      };

    } catch (error) {
      console.error('Error in Elasticsearch fuzzy search:', error);
      
      // Fallback to MongoDB search nếu Elasticsearch lỗi
      return await this.fallbackSearch(options);
    }
  },

  // Search suggestions/autocomplete
  async getSearchSuggestions(query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { success: true, data: [] };
      }

      const response = await esClient.search({
        index: PRODUCTS_INDEX,
        body: {
          suggest: {
            product_suggest: {
              prefix: query.trim(),
              completion: {
                field: 'name.suggest',
                size: limit
              }
            }
          },
          _source: ['name', 'price', 'images'],
          size: 0
        }
      });

      const suggestions = response.body.suggest.product_suggest[0].options.map(option => ({
        text: option.text,
        _source: option._source
      }));

      return {
        success: true,
        data: suggestions
      };

    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi lấy gợi ý tìm kiếm',
        error: error.message
      };
    }
  },

  // Tìm kiếm sản phẩm tương tự
  async findSimilarProducts(productId, limit = 6) {
    try {
      // Lấy thông tin sản phẩm gốc
      const originalProduct = await esClient.get({
        index: PRODUCTS_INDEX,
        id: productId
      });

      const product = originalProduct.body._source;

      // Tìm sản phẩm tương tự dựa trên category, tags, và price range
      const response = await esClient.search({
        index: PRODUCTS_INDEX,
        body: {
          query: {
            bool: {
              must_not: [
                { term: { _id: productId } }
              ],
              filter: [
                { term: { isActive: true } },
                { range: { stock: { gt: 0 } } }
              ],
              should: [
                { term: { categoryId: product.categoryId } },
                { terms: { 'tags.keyword': product.tags || [] } },
                {
                  range: {
                    price: {
                      gte: product.price * 0.7,
                      lte: product.price * 1.3
                    }
                  }
                }
              ],
              minimum_should_match: 1
            }
          },
          size: limit,
          sort: [
            '_score',
            { rating: { order: 'desc' } },
            { reviewCount: { order: 'desc' } }
          ]
        }
      });

      const products = response.body.hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
        _score: hit._score
      }));

      return {
        success: true,
        data: products
      };

    } catch (error) {
      console.error('Error finding similar products:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tìm sản phẩm tương tự',
        error: error.message
      };
    }
  },

  // Fallback search sử dụng Fuse.js nếu Elasticsearch không khả dụng
  async fallbackSearch(options = {}) {
    try {
      console.log('Using fallback search with Fuse.js');
      
      const {
        query = '',
        page = 1,
        limit = 12,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        categoryId,
        minPrice,
        maxPrice,
        minRating,
        hasDiscount = false,
        inStock = true
      } = options;

      // Lấy tất cả sản phẩm từ MongoDB
      let mongoQuery = { isActive: true };
      
      if (inStock) mongoQuery.stock = { $gt: 0 };
      if (categoryId) mongoQuery.categoryId = categoryId;
      if (minPrice || maxPrice) {
        mongoQuery.price = {};
        if (minPrice) mongoQuery.price.$gte = minPrice;
        if (maxPrice) mongoQuery.price.$lte = maxPrice;
      }
      if (minRating) mongoQuery.rating = { $gte: minRating };

      const allProducts = await Product.find(mongoQuery)
        .populate('categoryId', 'name slug')
        .lean();

      let filteredProducts = allProducts;

      // Filter discount
      if (hasDiscount) {
        filteredProducts = filteredProducts.filter(p => 
          p.originalPrice && p.price < p.originalPrice
        );
      }

      // Fuzzy search với Fuse.js
      if (query && query.trim()) {
        const fuse = new Fuse(filteredProducts, {
          keys: [
            { name: 'name', weight: 3 },
            { name: 'description', weight: 2 },
            { name: 'tags', weight: 2 },
            { name: 'categoryId.name', weight: 1.5 }
          ],
          threshold: 0.3,
          includeScore: true,
          includeMatches: true
        });

        const fuseResults = fuse.search(query.trim());
        filteredProducts = fuseResults.map(result => ({
          ...result.item,
          _score: 1 - result.score, // Convert Fuse score to Elasticsearch-like score
          matches: result.matches
        }));
      }

      // Sort
      filteredProducts.sort((a, b) => {
        if (query && query.trim()) {
          // Ưu tiên score khi có search query
          if (a._score !== b._score) {
            return b._score - a._score;
          }
        }

        switch (sortBy) {
          case 'price':
            return sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
          case 'rating':
            return sortOrder === 'desc' ? b.rating - a.rating : a.rating - b.rating;
          case 'name':
            return sortOrder === 'desc' 
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name);
          case 'createdAt':
          default:
            return sortOrder === 'desc' 
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : new Date(a.createdAt) - new Date(b.createdAt);
        }
      });

      // Pagination
      const totalProducts = filteredProducts.length;
      const totalPages = Math.ceil(totalProducts / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          products: paginatedProducts,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalProducts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
          },
          searchInfo: {
            query: query.trim(),
            totalHits: totalProducts,
            usingFallback: true
          }
        }
      };

    } catch (error) {
      console.error('Error in fallback search:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tìm kiếm sản phẩm',
        error: error.message
      };
    }
  }
};

module.exports = elasticSearchService;
