# Hệ thống Hiển thị Sản phẩm với Lazy Loading

Dự án fullstack với Express.js (Backend) và React.js (Frontend) implement chức năng hiển thị sản phẩm theo danh mục với Lazy Loading và phân trang.

## Tính năng chính

### Backend (Express.js)
- ✅ **API quản lý danh mục sản phẩm**
- ✅ **API hiển thị sản phẩm với phân trang**
- ✅ **API Lazy Loading cho infinite scroll**
- ✅ **Filter và tìm kiếm sản phẩm**
- ✅ **Hỗ trợ MongoDB và MySQL**
- ✅ **Seed dữ liệu mẫu**

### Frontend (React.js + TypeScript)
- ✅ **Hiển thị danh sách sản phẩm theo danh mục**
- ✅ **Lazy Loading với Infinite Scroll**
- ✅ **Filter theo giá, tìm kiếm, sắp xếp**
- ✅ **Responsive design**
- ✅ **Component-based architecture**

## Cấu trúc API

### Categories
```
GET /api/v1/categories                    - Lấy tất cả danh mục
GET /api/v1/categories/:id               - Lấy danh mục theo ID
GET /api/v1/categories/slug/:slug        - Lấy danh mục theo slug
```

### Products
```
GET /api/v1/products                     - Lấy tất cả sản phẩm (có phân trang)
GET /api/v1/products/featured           - Lấy sản phẩm nổi bật
GET /api/v1/products/load-more          - API cho Lazy Loading
GET /api/v1/products/:id                - Lấy chi tiết sản phẩm
GET /api/v1/categories/:id/products     - Lấy sản phẩm theo danh mục
GET /api/v1/category/:slug/products     - Lấy sản phẩm theo slug danh mục
```

### Query Parameters
- `page`: Trang hiện tại (default: 1)
- `limit`: Số sản phẩm mỗi trang (default: 12)
- `sortBy`: Sắp xếp theo (createdAt, price, name, rating)
- `sortOrder`: Thứ tự (asc, desc)
- `categoryId`: Filter theo ID danh mục
- `categorySlug`: Filter theo slug danh mục
- `minPrice`, `maxPrice`: Khoảng giá
- `search`: Tìm kiếm theo tên

## Cài đặt và chạy

### Backend (ExpressJS01)
```bash
cd ExpressJS01
npm install

# Cấu hình database trong .env
cp .env.example .env

# Seed dữ liệu mẫu
npm run seed

# Chạy server
npm run dev
```

### Frontend (reactjs01)
```bash
cd reactjs01
npm install

# Chạy development server
npm run dev
```

## Cấu hình Database

### MongoDB (mặc định)
```env
DB_TYPE=mongodb
MONGO_URI=mongodb://localhost:27017/expressjs01
```

### MySQL
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=expressjs01
```

## Lazy Loading Implementation

### 1. Infinite Scroll
- Sử dụng Intersection Observer API
- Tự động load thêm sản phẩm khi scroll đến cuối trang
- Hiển thị loading indicator

### 2. Manual Load More
- Button "Tải thêm sản phẩm"
- Phù hợp với người dùng muốn kiểm soát việc tải

### 3. Pagination
- Phân trang truyền thống với số trang
- Hỗ trợ cả hai cách: lazy loading và pagination

## Components Frontend

### ProductCard
- Hiển thị thông tin sản phẩm
- Hình ảnh, giá, đánh giá, tags
- Responsive design

### ProductGrid
- Grid layout cho danh sách sản phẩm
- Tích hợp Lazy Loading
- Infinite scroll hoặc manual load more

### CategoryFilter
- Filter theo danh mục sản phẩm
- Hiển thị danh sách danh mục

### ProductFilters
- Tìm kiếm, sắp xếp, filter giá
- Cập nhật URL params
- Debounce cho search

## Trang chính

### `/products`
- Hiển thị tất cả sản phẩm
- Sidebar với filters và categories
- Hỗ trợ Lazy Loading

### `/category/:categorySlug`
- Hiển thị sản phẩm theo danh mục
- Breadcrumb navigation
- Thông tin danh mục

## Responsive Design

- **Desktop**: 2-column layout (sidebar + main)
- **Tablet**: Stack layout, sidebar dưới main
- **Mobile**: Single column, optimized grid

## Performance Optimizations

1. **Lazy Loading Images**: `loading="lazy"`
2. **Debounced Search**: 500ms delay
3. **Intersection Observer**: Efficient scroll detection
4. **Memoized Components**: Prevent unnecessary re-renders
5. **Optimized Database Queries**: Pagination, indexing

## Dữ liệu mẫu

Script seed tạo:
- 5 danh mục (Điện thoại, Laptop, Tablet, Phụ kiện, Tai nghe)
- 75 sản phẩm với dữ liệu thực tế
- Hình ảnh placeholder
- Đánh giá và reviews ngẫu nhiên

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

### Backend
- Node.js + Express.js
- MongoDB với Mongoose
- MySQL với Sequelize
- JWT Authentication
- Nodemailer
- CORS, bcrypt

### Frontend
- React 18 + TypeScript
- React Router v6
- Axios
- CSS3 với Flexbox/Grid
- Intersection Observer API

## API Response Format

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalProducts": 120,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 12
    },
    "category": { ... }
  }
}
```

## Lazy Loading Response

```json
{
  "success": true,
  "data": {
    "products": [...],
    "hasMore": true,
    "currentPage": 2,
    "totalPages": 10
  }
}
```

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra .env configuration
- Đảm bảo MongoDB/MySQL đang chạy

### Frontend không load được data
- Kiểm tra backend server đang chạy
- Xem console for CORS errors
- Verify API endpoints

### Lazy Loading không hoạt động
- Kiểm tra browser support cho Intersection Observer
- Console log để debug infinite scroll trigger

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## License

MIT License
