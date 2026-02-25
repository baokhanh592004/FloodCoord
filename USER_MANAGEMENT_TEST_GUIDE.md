# HƯỚNG DẪN TEST USER MANAGEMENT (ADMIN)

## TỔNG QUAN
Module quản lý người dùng cho Admin với khả năng tạo tài khoản, cập nhật thông tin, phân quyền (Role) và vô hiệu hóa tài khoản.

---

## QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### 1. Quyền hạn
- Chỉ tài khoản có role **ADMIN** mới có quyền truy cập module này

### 2. Vai trò hệ thống (Roles)
| ID | Role Code | Tên hiển thị | Mô tả |
|----|-----------|--------------|-------|
| 1 | ADMIN | Quản Trị Viên | Toàn quyền quản lý hệ thống |
| 2 | MANAGER | Quản Lý | Quản lý nghiệp vụ và người dùng |
| 3 | COORDINATOR | Điều Phối Viên | Điều phối hoạt động và đội nhóm |
| 4 | RESCUE_TEAM | Đội Cứu Hộ | Thực hiện công tác cứu hộ, cứu nạn |
| 5 | MEMBER | Thành Viên | Người dùng thông thường |

### 3. Quy tắc Cập nhật
- ✅ **Email**: Không thể thay đổi sau khi tạo (unique identifier)
- ✅ **Role**: Admin có thể thay đổi role bất kỳ lúc nào
- ✅ **Status**: Có thể bật/tắt để vô hiệu hóa tài khoản
- ⚠️ **Mật khẩu**: Chỉ được set khi tạo mới, không hiển thị khi edit

### 4. Validation
- Email phải đúng định dạng và unique
- Mật khẩu: Tối thiểu 8 ký tự, bao gồm chữ và số
- Số điện thoại: Theo format Việt Nam (0xxx hoặc +84xxx)

---

## API ENDPOINTS

Base URL: `/api/admin/users`

| Hành động | Method | Endpoint | Mô tả |
|-----------|--------|----------|-------|
| Lấy danh sách | GET | `/` | Xem toàn bộ người dùng |
| Xem chi tiết | GET | `/{id}` | Xem chi tiết 1 user |
| Tạo mới | POST | `/` | Tạo tài khoản mới |
| Cập nhật | PUT | `/{id}` | Sửa thông tin, phân quyền |
| Xóa | DELETE | `/{id}` | Xóa tài khoản |

---

## LUỒNG TEST ĐẦY ĐỦ

### Bước 0️⃣: Chuẩn bị
1. Đăng nhập với tài khoản **ADMIN**
2. Vào trang: `/admin/users`
3. Hoặc từ AdminDashboard → Click card "Quản lý Người Dùng"

---

### Bước 1️⃣: Tạo tài khoản MANAGER mới

**Mục tiêu**: Thêm 1 Manager để quản lý nghiệp vụ

1. Click button **"Tạo tài khoản mới"** (góc phải trên)
2. Điền form:
   - **Họ và tên**: `Nguyễn Văn Quản Lý`
   - **Email**: `manager1@floodrescue.vn`
   - **Số điện thoại**: `0901234567`
   - **Mật khẩu**: `Manager123`
   - **Xác nhận mật khẩu**: `Manager123`
   - **Vai trò**: Chọn `📊 Quản Lý - Quản lý nghiệp vụ và người dùng`
   - **Tài khoản đang hoạt động**: ✅ Tick
3. Click **"Tạo tài khoản"**

**Kết quả mong đợi**:
- ✅ Modal đóng lại
- ✅ User card mới xuất hiện với:
  - Avatar màu xanh dương (gradient blue)
  - Badge "Quản Lý" màu xanh
  - Status "Active" màu xanh lá
- ✅ Stats "Tổng người dùng" tăng lên 1

---

### Bước 2️⃣: Tạo tài khoản COORDINATOR

1. Click **"Tạo tài khoản mới"**
2. Điền:
   - Họ tên: `Trần Thị Điều Phối`
   - Email: `coordinator1@floodrescue.vn`
   - Phone: `0912345678`
   - Password: `Coord123`
   - Role: `🎯 Điều Phối Viên`
   - Status: Active
3. Submit

**Kết quả**:
- Card với badge "Điều Phối Viên" màu cam

---

### Bước 3️⃣: Tạo tài khoản RESCUE_TEAM

1. Tạo user:
   - Họ tên: `Lê Văn Cứu Hộ`
   - Email: `rescuer1@floodrescue.vn`
   - Phone: `0923456789`
   - Password: `Rescue123`
   - Role: `🚨 Đội Cứu Hộ`
2. Submit

**Kết quả**: Badge màu xanh lá

---

### Bước 4️⃣: Xem chi tiết người dùng

1. Hover vào card **"Nguyễn Văn Quản Lý"**
2. Click icon **Eye (mắt)** để xem chi tiết

**Kết quả mong đợi**:
- Modal hiển thị với header gradient purple-blue
- Hiển thị đầy đủ:
  - Avatar to
  - Họ tên + Role badge
  - Status badge (Active/Inactive)
  - Email với icon thư
  - Số điện thoại với icon phone
  - ID hệ thống
- Button "Đóng" ở footer

---

### Bước 5️⃣: Cập nhật thông tin cơ bản

**Scenario**: Manager đổi số điện thoại

1. Click icon **Edit (bút chì)** trên card Manager
2. **Quan sát**:
   - ⚠️ **Warning box màu xanh** xuất hiện: "Email không thể thay đổi..."
   - Field Email bị **disabled** (mờ đi)
   - 🔒 Text "🔒 Email không thể thay đổi"
   - **KHÔNG có** field Mật khẩu (chỉ có khi tạo mới)
3. Sửa:
   - Số điện thoại → `0909999999`
4. Click **"Cập nhật"**

**Kết quả**:
- ✅ Số điện thoại cập nhật thành công
- ✅ Email, Role, Status giữ nguyên

---

### Bước 6️⃣: Thay đổi Role (Phân quyền) ⭐

**Mục tiêu**: Nâng cấp Rescuer thành Coordinator

1. Edit user **"Lê Văn Cứu Hộ"**
2. Thay đổi **Vai trò** → `🎯 Điều Phối Viên`
3. Click **"Cập nhật"**

**Kết quả mong đợi**:
- ✅ Badge chuyển từ màu xanh lá → màu cam
- ✅ Text "Đội Cứu Hộ" → "Điều Phối Viên"
- ✅ Avatar gradient chuyển màu (green → orange)
- ⚠️ **Backend sẽ cập nhật `roleId` trong database**

---

### Bước 7️⃣: Vô hiệu hóa tài khoản (Disable Account)

**Scenario**: Tạm khóa tài khoản Coordinator do vi phạm

1. Edit **"Trần Thị Điều Phối"**
2. **Bỏ tick** checkbox "Tài khoản đang hoạt động"
3. Submit

**Kết quả**:
- ✅ Status badge chuyển từ "Active" (xanh) → "Inactive" (đỏ)
- ✅ Stats "Đang hoạt động" giảm 1, "Đã vô hiệu hóa" tăng 1
- ⚠️ **User này sẽ không thể đăng nhập được nữa**

---

### Bước 8️⃣: Test Validation - Email trùng

**Mục tiêu**: Kiểm tra hệ thống chặn email duplicate

1. Click **"Tạo tài khoản mới"**
2. Điền email: `manager1@floodrescue.vn` (đã tồn tại)
3. Điền các field khác bất kỳ
4. Submit

**Kết quả mong đợi**:
- ❌ **Error banner màu đỏ** xuất hiện phía trên form
- ❌ Message: "Email đã tồn tại" (hoặc tương tự từ backend)
- ✅ Modal vẫn mở, dữ liệu form giữ nguyên để sửa

---

### Bước 9️⃣: Test Validation - Mật khẩu không khớp

1. Tạo user mới
2. Password: `Test1234`
3. Confirm Password: `Test5678` (KHÁC)
4. Submit

**Kết quả**:
- ❌ Error: "Mật khẩu xác nhận không khớp"
- ✅ Frontend validation, không gọi API

---

### Bước 🔟: Test Validation - Mật khẩu yếu

1. Tạo user với password: `123456` (chỉ có số, dưới 8 ký tự)
2. Submit

**Kết quả**:
- ❌ Error từ backend: "Mật khẩu phải tối thiểu 8 ký tự, bao gồm cả chữ và số"

---

### Bước 1️⃣1️⃣: Test Search & Filter

#### Test Search:
1. Gõ vào ô search: `Quản`
2. **Kết quả**: Chỉ hiển thị "Nguyễn Văn Quản Lý"

#### Test Filter by Role:
1. Chọn dropdown: `Điều Phối Viên`
2. **Kết quả**: Chỉ hiển thị users có role Điều Phối Viên

#### Test Combine:
1. Search: `Lê`
2. Filter: `Điều Phối Viên`
3. **Kết quả**: Hiển thị "Lê Văn Cứu Hộ" (nếu đã được nâng lên Coordinator ở bước 6)

---

### Bước 1️⃣2️⃣: Xóa người dùng

**Scenario**: Xóa tài khoản thừa

1. Click icon **Trash (thùng rác)** trên card bất kỳ
2. **Confirm dialog** xuất hiện: "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
3. Click **OK**

**Kết quả**:
- ✅ User card biến mất
- ✅ Stats cập nhật (Tổng người dùng giảm 1)
- ⚠️ Nếu user đang là Team Leader, backend có thể reject

---

## CHECKLIST KIỂM TRA UI/UX

### ✅ Dashboard
- [ ] Stats cards hiển thị đúng số liệu (Tổng/Active/Inactive/Roles)
- [ ] Search bar hoạt động real-time
- [ ] Filter dropdown cập nhật theo data
- [ ] Loading spinner khi fetch data
- [ ] Error banner hiển thị khi API lỗi

### ✅ User Cards
- [ ] Avatar màu gradient theo role:
  - Purple (ADMIN)
  - Blue (MANAGER)
  - Orange (COORDINATOR)
  - Green (RESCUE_TEAM)
  - Gray (MEMBER)
- [ ] Role badge đúng màu và text
- [ ] Status badge: Green (Active) / Red (Inactive)
- [ ] Team info hiển thị nếu user thuộc team
- [ ] Leader badge hiển thị nếu là Team Leader
- [ ] Hover effect (scale + shadow)

### ✅ Create/Edit Modal
- [ ] Header gradient purple-blue
- [ ] Warning box khi edit (email locked)
- [ ] Password fields CHỈ hiển thị khi Create
- [ ] Email disabled khi Edit
- [ ] Role dropdown hiển thị icon + tên + mô tả
- [ ] Status checkbox hoạt động
- [ ] Validation messages hiển thị đúng vị trí
- [ ] Loading state khi submit (button disabled + text "Đang xử lý...")

### ✅ Detail Modal
- [ ] Header gradient
- [ ] Avatar to, màu theo role
- [ ] Contact info với icons
- [ ] Team section hiển thị nếu có
- [ ] System ID hiển thị

### ✅ Business Logic
- [ ] Email unique validation
- [ ] Password strength validation
- [ ] Role update cập nhật đúng roleId
- [ ] Status toggle vô hiệu hóa login
- [ ] Search filter chính xác
- [ ] Stats auto-update sau CRUD

---

## DATA MẪU ĐỀ XUẤT

Để test đầy đủ, tạo ít nhất:

```
1. Admin:     admin@floodrescue.vn       | Admin123
2. Manager:   manager1@floodrescue.vn    | Manager123
3. Manager:   manager2@floodrescue.vn    | Manager123
4. Coordinator: coord1@floodrescue.vn    | Coord123
5. Coordinator: coord2@floodrescue.vn    | Coord123
6. Rescuer:   rescuer1@floodrescue.vn    | Rescue123
7. Rescuer:   rescuer2@floodrescue.vn    | Rescue123
8. Member:    member1@floodrescue.vn     | Member123
```

---

## TROUBLESHOOTING

### ❌ Lỗi: "Không thể tải danh sách người dùng"
**Nguyên nhân**: Backend chưa chạy hoặc endpoint `/api/admin/users` lỗi  
**Giải pháp**: Kiểm tra backend logs, verify token JWT

### ❌ Lỗi: 403 Forbidden
**Nguyên nhân**: Tài khoản không có role ADMIN  
**Giải pháp**: Đăng nhập lại với tài khoản ADMIN

### ❌ Lỗi: Role không update
**Nguyên nhân**: Backend không nhận `roleId` hoặc sai mapping  
**Giải pháp**: Kiểm tra backend `UserUpdateRequest` có field `roleId` không

### ❌ Lỗi: "rollCode" undefined
**Nguyên nhân**: Backend dùng typo `rollCode` thay vì `roleCode`  
**Giải pháp**: Frontend đã handle, gửi `rollCode` trong createUser

---

## NOTES QUAN TRỌNG

1. **Email Immutable**: Sau khi tạo, email không thể sửa (business rule)
2. **Password Reset**: Không có chức năng đổi password trong admin panel, phải dùng "Forgot Password"
3. **Role Mapping**: 
   - Frontend map roleName → roleId khi edit
   - Backend cần roleId (Long) để update
4. **Team Leader**: Không nên xóa user đang là Team Leader (backend validation)
5. **Self-Delete**: Nên chặn admin xóa chính mình (tránh lock out)

---

**Hoàn thành test guide**: 2026-02-25  
**Version**: 1.0  
**Tested by**: [Your Name]
