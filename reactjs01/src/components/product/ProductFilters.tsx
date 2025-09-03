import React, { useState } from 'react';
import type { ProductFilters } from '../../types/product.types';
import { sortOptions } from '../../types/product.types';

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (newFilters: ProductFilters) => void;
  totalProducts?: number;
}

const ProductFiltersComponent: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  totalProducts
}) => {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = sortOptions.find(option => option.value === e.target.value);
    if (selectedOption) {
      onFiltersChange({
        ...filters,
        sortBy: selectedOption.sortBy as any,
        sortOrder: selectedOption.sortOrder
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value
    });
  };

  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const newPriceRange = { ...priceRange, [field]: value };
    setPriceRange(newPriceRange);
    
    // Debounce price filter
    setTimeout(() => {
      onFiltersChange({
        ...filters,
        minPrice: newPriceRange.min ? Number(newPriceRange.min) : undefined,
        maxPrice: newPriceRange.max ? Number(newPriceRange.max) : undefined
      });
    }, 500);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      limit: Number(e.target.value),
      page: 1 // Reset to first page when changing limit
    });
  };

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' });
    onFiltersChange({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const getCurrentSortValue = () => {
    const currentSort = sortOptions.find(
      option => option.sortBy === filters.sortBy && option.sortOrder === filters.sortOrder
    );
    return currentSort?.value || 'newest';
  };

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3>Bộ lọc sản phẩm</h3>
        {totalProducts !== undefined && (
          <span className="total-products">({totalProducts} sản phẩm)</span>
        )}
      </div>

      <div className="filters-content">
        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search">Tìm kiếm</label>
          <input
            id="search"
            type="text"
            placeholder="Nhập tên sản phẩm..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="sort">Sắp xếp theo</label>
          <select
            id="sort"
            value={getCurrentSortValue()}
            onChange={handleSortChange}
            className="sort-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label>Khoảng giá (VNĐ)</label>
          <div className="price-range">
            <input
              type="number"
              placeholder="Giá từ"
              value={priceRange.min}
              onChange={(e) => handlePriceRangeChange('min', e.target.value)}
              className="price-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Giá đến"
              value={priceRange.max}
              onChange={(e) => handlePriceRangeChange('max', e.target.value)}
              className="price-input"
            />
          </div>
        </div>

        {/* Items per page */}
        <div className="filter-group">
          <label htmlFor="limit">Hiển thị</label>
          <select
            id="limit"
            value={filters.limit || 12}
            onChange={handleLimitChange}
            className="limit-select"
          >
            <option value={12}>12 sản phẩm</option>
            <option value={24}>24 sản phẩm</option>
            <option value={36}>36 sản phẩm</option>
            <option value={48}>48 sản phẩm</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            Xóa bộ lọc
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFiltersComponent;
