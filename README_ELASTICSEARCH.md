# Fuzzy Search với Elasticsearch

Dự án đã được nâng cấp với chức năng tìm kiếm fuzzy search sử dụng Elasticsearch và các bộ lọc nâng cao.

## Tính năng mới

### Backend
- **Fuzzy Search**: Tìm kiếm mờ với khả năng chịu lỗi chính tả
- **Advanced Filtering**: Lọc theo nhiều tiêu chí (giá, đánh giá, khuyến mãi, lượt xem, tags)
- **Search Suggestions**: Gợi ý tự động khi nhập
- **Similar Products**: Tìm sản phẩm tương tự
- **Fallback Search**: Tự động chuyển sang tìm kiếm MongoDB khi Elasticsearch không khả dụng

### Frontend
- **Advanced Search Page**: Trang tìm kiếm nâng cao với nhiều bộ lọc
- **Search Suggestions**: Gợi ý tự động trong header
- **Real-time Search**: Tìm kiếm theo thời gian thực
- **Filter UI**: Giao diện lọc thân thiện

## Cài đặt Elasticsearch

### Option 1: Docker (Khuyến nghị)
```bash
# Tạo network
docker network create elastic

# Chạy Elasticsearch
docker run --name elasticsearch --net elastic -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -e "xpack.security.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Kiểm tra
curl http://localhost:9200
```

### Option 2: Cài đặt trực tiếp
1. Tải Elasticsearch từ: https://www.elastic.co/downloads/elasticsearch
2. Giải nén và chạy: `bin/elasticsearch` (Linux/Mac) hoặc `bin\elasticsearch.bat` (Windows)
3. Kiểm tra: http://localhost:9200

## Cấu hình

### Backend (.env)
```env
# Elasticsearch config
ELASTICSEARCH_URL=http://localhost:9200
# ES_USERNAME=elastic
# ES_PASSWORD=your_elasticsearch_password
```

### Đồng bộ dữ liệu vào Elasticsearch
```bash
# Từ thư mục ExpressJS01
npm run sync:elasticsearch
```

## API Endpoints mới

### Search Products
```
GET /api/v1/products/search
```
**Parameters:**
- `query`: Từ khóa tìm kiếm
- `page`: Trang (default: 1)
- `limit`: Số sản phẩm/trang (default: 12)
- `sortBy`: Sắp xếp theo (createdAt, price, name, rating, viewCount)
- `sortOrder`: Thứ tự (asc, desc)
- `categoryId`: ID danh mục
- `minPrice`, `maxPrice`: Khoảng giá
- `minRating`, `maxRating`: Khoảng đánh giá
- `hasDiscount`: Chỉ sản phẩm có khuyến mãi (true/false)
- `inStock`: Chỉ sản phẩm còn hàng (true/false)
- `minViewCount`: Lượt xem tối thiểu
- `tags`: Danh sách tags (array)

### Search Suggestions
```
GET /api/v1/products/search/suggestions?q=iphone
```

### Similar Products
```
GET /api/v1/products/:productId/similar
```

### Admin: Sync to Elasticsearch
```
POST /api/v1/admin/sync/elasticsearch
```

## Frontend Routes mới

### Search Page
```
/search?q=keyword&categoryId=123&minPrice=100&maxPrice=1000
```

## Sử dụng

### 1. Tìm kiếm cơ bản
- Sử dụng ô tìm kiếm trong header
- Nhập từ khóa và Enter

### 2. Tìm kiếm nâng cao
- Truy cập `/search`
- Sử dụng các bộ lọc:
  - Khoảng giá
  - Đánh giá
  - Danh mục
  - Sản phẩm có khuyến mãi
  - Sản phẩm còn hàng
  - Lượt xem tối thiểu
  - Tags

### 3. Gợi ý tìm kiếm
- Nhập ít nhất 2 ký tự trong ô tìm kiếm
- Chọn từ danh sách gợi ý

## Cấu trúc Files mới

### Backend
```
src/
├── config/
│   └── elasticsearch.js          # Cấu hình Elasticsearch
├── services/
│   └── elasticSearchService.js   # Service cho Elasticsearch
└── controllers/
    └── productController.js      # Thêm search endpoints
```

### Frontend
```
src/
├── components/
│   └── product/
│       └── AdvancedSearch.tsx    # Component tìm kiếm nâng cao
├── pages/
│   └── search.tsx                # Trang tìm kiếm
├── styles/
│   └── search.css                # Styles cho tìm kiếm
└── types/
    └── product.types.ts          # Types mới
```

## Tính năng Fuzzy Search

### Elasticsearch Features
- **Multi-field search**: Tìm trong tên, mô tả, tags, danh mục
- **Fuzziness**: Tự động sửa lỗi chính tả
- **Phrase matching**: Ưu tiên kết quả chính xác
- **Prefix matching**: Hỗ trợ autocomplete
- **Scoring**: Xếp hạng kết quả theo độ liên quan

### Fallback System
- Tự động chuyển sang MongoDB khi Elasticsearch lỗi
- Sử dụng Fuse.js cho fuzzy search
- Đảm bảo ứng dụng luôn hoạt động

## Troubleshooting

### Elasticsearch không kết nối được
1. Kiểm tra Elasticsearch đang chạy: `curl http://localhost:9200`
2. Kiểm tra URL trong .env
3. Xem logs server để biết lỗi cụ thể

### Không có kết quả tìm kiếm
1. Đồng bộ dữ liệu: `npm run sync:elasticsearch`
2. Kiểm tra index có tồn tại: `curl http://localhost:9200/products`
3. Thử tìm kiếm fallback (tắt Elasticsearch)

### Performance
- Index sẽ được tạo tự động khi server khởi động
- Dữ liệu được đồng bộ khi thêm/sửa sản phẩm
- Sử dụng pagination để tránh tải quá nhiều dữ liệu

## Demo

### 1. Tìm kiếm fuzzy
```
Query: "ipone" → Kết quả: iPhone, iPad, etc.
Query: "dien thoai" → Kết quả: Điện thoại các loại
```

### 2. Filter nâng cao
```
- Giá: 1,000,000 - 5,000,000 VND
- Đánh giá: 4 sao trở lên
- Có khuyến mãi: true
- Tags: sale, hot
```

### 3. Sort options
- Mới nhất
- Giá thấp → cao
- Đánh giá cao nhất
- Xem nhiều nhất
- Liên quan nhất (khi có search query)
