# KanbanFlow Backend API

KanbanFlow là một ứng dụng quản lý dự án theo phương pháp Kanban, được xây dựng với Node.js, Express và PostgreSQL.

## 🚀 Tính năng

- ✅ Xác thực người dùng (JWT)
- ✅ Quản lý boards, lists, cards
- ✅ Hệ thống phân quyền
- ✅ Comments và attachments
- ✅ Activity tracking
- ✅ Real-time updates (coming soon)
- ✅ File upload
- ✅ Email notifications (coming soon)

## 🛠️ Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi
- **File Upload**: Multer
- **Password Hashing**: bcryptjs

## 📋 Yêu cầu hệ thống

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm hoặc yarn

## ⚡ Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd kanbanflowBE
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Sao chép file `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kanbanflow
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Thiết lập Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE kanbanflow;
```

Chạy file init.sql để tạo tables:

```bash
psql -U postgres -d kanbanflow -f database/init.sql
```

### 5. Chạy ứng dụng

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## 📚 API Documentation

### Authentication

#### Đăng ký

```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Đăng nhập

```http
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Lấy thông tin profile

```http
GET /api/v1/users/profile
Authorization: Bearer <your-token>
```

### Users (Admin only)

#### Lấy danh sách users

```http
GET /api/v1/users
Authorization: Bearer <admin-token>
```

## 🗂️ Cấu trúc project

```
src/
├── api/
│   └── users/
│       ├── userController.js
│       ├── userService.js
│       └── userRoutes.js
├── config/
│   └── database.js
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── services/
├── utils/
│   ├── ApiError.js
│   ├── ApiResponse.js
│   └── asyncHandler.js
└── app.js
```

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Docker (coming soon)

```bash
docker build -t kanbanflow-api .
docker run -p 3000:3000 kanbanflow-api
```

### Environment Variables

Đảm bảo cấu hình đúng các biến môi trường cho production:

- `NODE_ENV=production`
- `JWT_SECRET`: Secret key mạnh
- Database credentials
- CORS origins

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🆘 Support

Nếu bạn gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.
