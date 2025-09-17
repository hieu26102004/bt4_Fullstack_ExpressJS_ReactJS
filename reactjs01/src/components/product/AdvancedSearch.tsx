import React, { useState, useEffect } from 'react';
import type { ProductFilters, SearchSuggestion } from '../../types/product.types';
import { searchProductSuggestions } from '../../util/api';

interface AdvancedSearchProps {
  filters: ProductFilters;
  onFiltersChange: (newFilters: ProductFilters) => void;
  onSearch: () => void;
  isSearching?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  isSearching = false
}) => {
  const [searchQuery, setSearchQuery] = useState(filters.query || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          const response = await searchProductSuggestions(searchQuery.trim());
          if (response?.data) {
            setSuggestions(response.data as SearchSuggestion[]);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      query: searchQuery.trim(),
      page: 1
    });
    setShowSuggestions(false);
    onSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    onFiltersChange({
      ...filters,
      query: suggestion.text,
      page: 1
    });
    setShowSuggestions(false);
    onSearch();
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1 // Reset page when filters change
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onFiltersChange({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="advanced-search">
      <div className="search-section">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay to allow suggestion click
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            <button
              type="submit"
              className="search-button"
              disabled={isSearching}
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>

            {/* Search Suggestions */}
            {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
              <div className="search-suggestions">
                {isLoadingSuggestions ? (
                  <div className="suggestion-item loading">Đang tải...</div>
                ) : (
                  suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="suggestion-content">
                        <span className="suggestion-text">{suggestion.text}</span>
                        <span className="suggestion-price">
                          {formatPrice(suggestion._source.price)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="filters-section">
        <h3>Bộ lọc nâng cao</h3>
        
        <div className="filter-groups">
          {/* Price Range */}
          <div className="filter-group">
            <label>Khoảng giá (VNĐ)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Giá từ"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
              <span className="separator">-</span>
              <input
                type="number"
                placeholder="Giá đến"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                className="price-input"
              />
            </div>
          </div>

          {/* Rating Range */}
          <div className="filter-group">
            <label>Đánh giá</label>
            <div className="rating-range">
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                className="rating-select"
              >
                <option value="">Tất cả</option>
                <option value="4">4 sao trở lên</option>
                <option value="3">3 sao trở lên</option>
                <option value="2">2 sao trở lên</option>
                <option value="1">1 sao trở lên</option>
              </select>
            </div>
          </div>

          {/* Stock Filter */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.inStock !== false}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              />
              Chỉ hiển thị sản phẩm còn hàng
            </label>
          </div>

          {/* Discount Filter */}
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.hasDiscount || false}
                onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
              />
              Chỉ sản phẩm có khuyến mãi
            </label>
          </div>

          {/* View Count Filter */}
          <div className="filter-group">
            <label>Lượt xem tối thiểu</label>
            <input
              type="number"
              placeholder="Số lượt xem"
              value={filters.minViewCount || ''}
              onChange={(e) => handleFilterChange('minViewCount', e.target.value ? Number(e.target.value) : undefined)}
              className="view-input"
            />
          </div>

          {/* Tags Filter */}
          <div className="filter-group">
            <label>Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              placeholder="Ví dụ: sale, hot, new"
              value={filters.tags?.join(', ') || ''}
              onChange={(e) => {
                const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                handleFilterChange('tags', tags.length > 0 ? tags : undefined);
              }}
              className="tags-input"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={clearAllFilters} className="clear-button">
            Xóa tất cả bộ lọc
          </button>
          <button onClick={onSearch} className="apply-button" disabled={isSearching}>
            {isSearching ? 'Đang áp dụng...' : 'Áp dụng bộ lọc'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
