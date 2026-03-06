# Services & API Structure

## Cấu trúc thư mục

```
src/
├── api/
│   └── axiosClient.js          # Cấu hình axios instance, interceptors
├── services/
│   ├── authApi.jsx             # API calls cho authentication (login, register, etc.)
│   ├── rescueApi.jsx           # API calls cho rescue requests
│   └── README.md               # File này
```

## Giải thích

### 📁 `api/` folder
- **Mục đích**: Chứa cấu hình cơ bản cho HTTP client
- **File chính**: `axiosClient.js`
  - Setup axios instance với baseURL
  - Interceptor tự động gắn JWT token
  - Xử lý refresh token khi hết hạn
  - Redirect về login khi unauthorized

### 📁 `services/` folder
- **Mục đích**: Chứa các function gọi API theo từng module/feature
- **Đặc điểm**:
  - Mỗi file tương ứng với 1 domain/module (auth, rescue, user, etc.)
  - Import `axiosClient` từ `api/` để gọi API
  - Export các function với tên rõ ràng
  - Xử lý error và format data trước khi return

### Ví dụ sử dụng

```jsx
// Trong component
import { rescueApi } from '../../services/rescueApi';

const MyComponent = () => {
  const handleSubmit = async (data) => {
    try {
      const response = await rescueApi.requestRescue(data);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
};
```

## API không cần login

Các API sau có thể gọi **mà không cần đăng nhập** (public endpoints):

### 🚨 Rescue APIs
- `POST /api/rescue-requests` - Tạo yêu cầu cứu trợ
- `GET /api/rescue-requests/track?code=XXX` - Tra cứu tracking code

### 🔐 Auth APIs
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu

> **Lưu ý**: Các endpoint này đã được config `permitAll()` ở backend (SecurityConfiguration.java)

## Khi nào cần thêm service mới?

Tạo file mới trong `services/` khi:
- Có module/feature mới (ví dụ: `teamApi.jsx`, `coordinatorApi.jsx`)
- Tránh file quá dài (> 200 lines)
- Các API thuộc về cùng 1 domain logic

## Best Practices

✅ **Nên làm**:
- Đặt tên function rõ ràng: `createRescueRequest()`, `trackRequest()`
- Catch error trong service và throw lại để component xử lý
- Comment cho các API phức tạp
- Nhóm các API liên quan vào cùng 1 file

❌ **Không nên**:
- Gọi axios trực tiếp trong component (luôn qua service)
- Xử lý UI logic trong service (alert, navigate, etc.)
- Hard-code URL (dùng env variables)
