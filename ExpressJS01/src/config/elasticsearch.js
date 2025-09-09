const { Client } = require('@elastic/elasticsearch');

// Cấu hình Elasticsearch client
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://127.0.0.1:9200',
  // Thêm compatibility headers cho version 8
  headers: {
    'Accept': 'application/vnd.elasticsearch+json; compatible-with=8',
    'Content-Type': 'application/vnd.elasticsearch+json; compatible-with=8'
  },
  // Có thể thêm authentication nếu cần
  // auth: {
  //   username: process.env.ES_USERNAME,
  //   password: process.env.ES_PASSWORD
  // }
});

// Index name cho products
const PRODUCTS_INDEX = 'products';

// Mapping cho products index
const PRODUCTS_MAPPING = {
  mappings: {
    properties: {
      name: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: {
            type: 'keyword'
          },
          suggest: {
            type: 'completion'
          }
        }
      },
      description: {
        type: 'text',
        analyzer: 'standard'
      },
      price: {
        type: 'double'
      },
      originalPrice: {
        type: 'double'
      },
      categoryId: {
        type: 'keyword'
      },
      categoryName: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: {
            type: 'keyword'
          }
        }
      },
      images: {
        type: 'keyword'
      },
      stock: {
        type: 'integer'
      },
      isActive: {
        type: 'boolean'
      },
      slug: {
        type: 'keyword'
      },
      tags: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: {
            type: 'keyword'
          }
        }
      },
      rating: {
        type: 'double'
      },
      reviewCount: {
        type: 'integer'
      },
      createdAt: {
        type: 'date'
      },
      updatedAt: {
        type: 'date'
      },
      discountPercentage: {
        type: 'double'
      },
      viewCount: {
        type: 'integer'
      },
      // Trường để lưu tất cả text có thể search
      searchText: {
        type: 'text',
        analyzer: 'standard'
      }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding']
        }
      }
    }
  }
};

// Utility functions
const elasticsearchUtils = {
  // Kiểm tra kết nối Elasticsearch
  async checkConnection() {
    try {
      await esClient.ping();
      console.log('✅ Elasticsearch connection successful');
      return true;
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error.message);
      return false;
    }
  },

  // Tạo index nếu chưa tồn tại
  async createIndexIfNotExists() {
    try {
      const indexExists = await esClient.indices.exists({ index: PRODUCTS_INDEX });
      
      if (!indexExists) {
        await esClient.indices.create({
          index: PRODUCTS_INDEX,
          body: PRODUCTS_MAPPING
        });
        console.log(`✅ Created Elasticsearch index: ${PRODUCTS_INDEX}`);
      } else {
        console.log(`✅ Elasticsearch index ${PRODUCTS_INDEX} already exists`);
      }
      return true;
    } catch (error) {
      console.error('❌ Error creating Elasticsearch index:', error);
      return false;
    }
  },

  // Index một sản phẩm
  async indexProduct(product) {
    try {
      // Chuẩn bị dữ liệu để index
      const productData = {
        ...product,
        categoryName: product.categoryId?.name || '',
        discountPercentage: product.originalPrice && product.price 
          ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
          : 0,
        viewCount: product.viewCount || 0,
        searchText: `${product.name} ${product.description || ''} ${product.tags?.join(' ') || ''} ${product.categoryId?.name || ''}`
      };

      await esClient.index({
        index: PRODUCTS_INDEX,
        id: product._id.toString(),
        body: productData
      });

      return true;
    } catch (error) {
      console.error('Error indexing product:', error);
      return false;
    }
  },

  // Index nhiều sản phẩm cùng lúc
  async bulkIndexProducts(products) {
    try {
      const body = [];
      
      products.forEach(product => {
        const productData = {
          ...product,
          categoryName: product.categoryId?.name || '',
          discountPercentage: product.originalPrice && product.price 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
            : 0,
          viewCount: product.viewCount || 0,
          searchText: `${product.name} ${product.description || ''} ${product.tags?.join(' ') || ''} ${product.categoryId?.name || ''}`
        };

        body.push({ index: { _index: PRODUCTS_INDEX, _id: product._id.toString() } });
        body.push(productData);
      });

      if (body.length > 0) {
        const response = await esClient.bulk({ body });
        console.log(`✅ Bulk indexed ${products.length} products`);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error bulk indexing products:', error);
      return null;
    }
  },

  // Xóa sản phẩm khỏi index
  async deleteProduct(productId) {
    try {
      await esClient.delete({
        index: PRODUCTS_INDEX,
        id: productId.toString()
      });
      return true;
    } catch (error) {
      console.error('Error deleting product from index:', error);
      return false;
    }
  },

  // Xóa toàn bộ index
  async deleteIndex() {
    try {
      await esClient.indices.delete({ index: PRODUCTS_INDEX });
      console.log(`✅ Deleted Elasticsearch index: ${PRODUCTS_INDEX}`);
      return true;
    } catch (error) {
      console.error('Error deleting index:', error);
      return false;
    }
  }
};

module.exports = {
  esClient,
  PRODUCTS_INDEX,
  PRODUCTS_MAPPING,
  elasticsearchUtils
};
