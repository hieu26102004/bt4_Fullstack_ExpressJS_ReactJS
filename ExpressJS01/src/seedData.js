const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/category');
const Product = require('./models/product');

// Kết nối database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL || 'mongodb://localhost:27017/mongodb');
    console.log('Kết nối MongoDB thành công');
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error);
    process.exit(1);
  }
};

// Dữ liệu mẫu cho categories
const sampleCategories = [
  {
    name: 'Điện thoại',
    description: 'Các loại điện thoại thông minh',
    slug: 'dien-thoai'
  },
  {
    name: 'Laptop',
    description: 'Máy tính xách tay các loại',
    slug: 'laptop'
  },
  {
    name: 'Tablet',
    description: 'Máy tính bảng',
    slug: 'tablet'
  },
  {
    name: 'Phụ kiện',
    description: 'Phụ kiện điện tử',
    slug: 'phu-kien'
  },
  {
    name: 'Tai nghe',
    description: 'Tai nghe và âm thanh',
    slug: 'tai-nghe'
  }
];

// Tạo dữ liệu mẫu cho products
const createSampleProducts = (categories) => {
  const products = [];

  // Điện thoại
  const phoneCategory = categories.find(cat => cat.slug === 'dien-thoai');
  if (phoneCategory) {
    for (let i = 1; i <= 20; i++) {
      products.push({
        name: `iPhone ${i + 10}`,
        description: `Điện thoại iPhone ${i + 10} với công nghệ tiên tiến`,
        price: 15000000 + (i * 1000000),
        originalPrice: 18000000 + (i * 1000000),
        categoryId: phoneCategory._id,
        images: [
          'https://via.placeholder.com/300x300?text=iPhone',
          'https://via.placeholder.com/300x300?text=iPhone+2'
        ],
        stock: Math.floor(Math.random() * 100) + 10,
        slug: `iphone-${i + 10}`,
        tags: ['apple', 'smartphone', 'ios'],
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 100) + 10
      });
    }

    for (let i = 1; i <= 15; i++) {
      products.push({
        name: `Samsung Galaxy S${i + 20}`,
        description: `Điện thoại Samsung Galaxy S${i + 20} màn hình lớn`,
        price: 12000000 + (i * 800000),
        originalPrice: 15000000 + (i * 800000),
        categoryId: phoneCategory._id,
        images: [
          'https://via.placeholder.com/300x300?text=Samsung',
          'https://via.placeholder.com/300x300?text=Samsung+2'
        ],
        stock: Math.floor(Math.random() * 100) + 10,
        slug: `samsung-galaxy-s${i + 20}`,
        tags: ['samsung', 'android', 'smartphone'],
        rating: 4 + Math.random(),
        reviewCount: Math.floor(Math.random() * 100) + 10
      });
    }
  }

  // Laptop
  const laptopCategory = categories.find(cat => cat.slug === 'laptop');
  if (laptopCategory) {
    for (let i = 1; i <= 18; i++) {
      products.push({
        name: `MacBook Pro ${i + 13}"`,
        description: `MacBook Pro ${i + 13}" với chip M${i} mạnh mẽ`,
        price: 25000000 + (i * 2000000),
        originalPrice: 30000000 + (i * 2000000),
        categoryId: laptopCategory._id,
        images: [
          'https://via.placeholder.com/300x300?text=MacBook',
          'https://via.placeholder.com/300x300?text=MacBook+2'
        ],
        stock: Math.floor(Math.random() * 50) + 5,
        slug: `macbook-pro-${i + 13}`,
        tags: ['apple', 'laptop', 'macbook'],
        rating: 4.2 + Math.random() * 0.8,
        reviewCount: Math.floor(Math.random() * 80) + 20
      });
    }

    for (let i = 1; i <= 12; i++) {
      products.push({
        name: `Dell XPS ${i + 13}`,
        description: `Dell XPS ${i + 13} thiết kế cao cấp, hiệu năng mạnh`,
        price: 20000000 + (i * 1500000),
        originalPrice: 24000000 + (i * 1500000),
        categoryId: laptopCategory._id,
        images: [
          'https://via.placeholder.com/300x300?text=Dell+XPS',
          'https://via.placeholder.com/300x300?text=Dell+XPS+2'
        ],
        stock: Math.floor(Math.random() * 50) + 5,
        slug: `dell-xps-${i + 13}`,
        tags: ['dell', 'laptop', 'windows'],
        rating: 4 + Math.random() * 0.8,
        reviewCount: Math.floor(Math.random() * 60) + 15
      });
    }
  }

  // Tablet
  const tabletCategory = categories.find(cat => cat.slug === 'tablet');
  if (tabletCategory) {
    for (let i = 1; i <= 10; i++) {
      products.push({
        name: `iPad Air ${i + 4}`,
        description: `iPad Air ${i + 4} với màn hình Retina sắc nét`,
        price: 12000000 + (i * 1000000),
        originalPrice: 15000000 + (i * 1000000),
        categoryId: tabletCategory._id,
        images: [
          'https://via.placeholder.com/300x300?text=iPad',
          'https://via.placeholder.com/300x300?text=iPad+2'
        ],
        stock: Math.floor(Math.random() * 30) + 5,
        slug: `ipad-air-${i + 4}`,
        tags: ['apple', 'tablet', 'ipad'],
        rating: 4.3 + Math.random() * 0.7,
        reviewCount: Math.floor(Math.random() * 50) + 10
      });
    }
  }

  return products;
};

// Hàm seed dữ liệu
const seedData = async () => {
  try {
    await connectDB();

    // Xóa dữ liệu cũ
    console.log('Đang xóa dữ liệu cũ...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Tạo categories
    console.log('Đang tạo categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log(`Đã tạo ${categories.length} categories`);

    // Tạo products
    console.log('Đang tạo products...');
    const sampleProducts = createSampleProducts(categories);
    const products = await Product.insertMany(sampleProducts);
    console.log(`Đã tạo ${products.length} products`);

    console.log('Seed dữ liệu thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

// Chạy seed
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
