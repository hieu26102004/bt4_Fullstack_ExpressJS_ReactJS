import React, { useState, useEffect } from 'react';
import type { Category } from '../../types/product.types';
import { getAllCategoriesApi } from '../../util/api';

interface CategoryFilterProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategoryId,
  onCategoryChange
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategoriesApi();
        const result = response.data as any;
        if (result?.success) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    onCategoryChange(categoryId);
  };

  if (loading) {
    return (
      <div className="category-filter loading">
        <div className="loading-placeholder">Đang tải danh mục...</div>
      </div>
    );
  }

  return (
    <div className="category-filter">
      <h3 className="filter-title">Danh mục sản phẩm</h3>
      
      <div className="category-list">
        {/* All Categories Option */}
        <button
          className={`category-item ${!selectedCategoryId ? 'active' : ''}`}
          onClick={() => handleCategoryClick(null)}
        >
          <span className="category-name">Tất cả sản phẩm</span>
        </button>

        {/* Individual Categories */}
        {categories.map((category) => (
          <button
            key={category._id}
            className={`category-item ${selectedCategoryId === category._id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(category._id)}
          >
            <span className="category-name">{category.name}</span>
            {category.description && (
              <span className="category-description">{category.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
