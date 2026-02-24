# HƯỚNG DẪN TEST VEHICLE MANAGEMENT

## TỔNG QUAN
Module quản lý phương tiện cứu hộ với đầy đủ chức năng CRUD và validation theo business rules.

---

## QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### 1. Quyền hạn
- Chỉ tài khoản có role **MANAGER** hoặc **ADMIN** mới có quyền thêm/sửa/xóa

### 2. Trạng thái Phương tiện (Lifecycle)
- **AVAILABLE**: Sẵn sàng, đang trong kho
- **IN_USE**: Đang được Đội cứu hộ sử dụng (đang làm nhiệm vụ)
- **MAINTENANCE**: Đang bảo trì/sửa chữa
- **UNAVAILABLE**: Không còn sử dụng được (hư hỏng nặng/thanh lý)

### 3. Quy tắc Cập nhật (Update Rules)
- ✅ **Thông tin cơ bản** (Tên, Biển số, Loại, Sức chứa): Có thể sửa bất cứ lúc nào
- ⚠️ **Trạng thái (Status)**:
  - ❌ **KHÔNG được** chuyển sang MAINTENANCE/UNAVAILABLE nếu đang **IN_USE**
  - ✅ Phải thu hồi xe về (chuyển về AVAILABLE) trước khi bảo trì
  - Backend sẽ tự động ngắt liên kết với Đội cứu hộ khi chuyển sang MAINTENANCE/UNAVAILABLE

### 4. Validation
- Tên phương tiện phải **duy nhất** trong hệ thống

---

## API ENDPOINTS

Base URL: `/api/manager/vehicles`

| Hành động | Method | Endpoint | Mô tả |
|-----------|--------|----------|-------|
| Thêm xe mới | POST | `/` | Tạo phương tiện mới (status mặc định: AVAILABLE) |
| Lấy danh sách | GET | `/` | Xem toàn bộ danh sách phương tiện |
| Xem chi tiết | GET | `/{id}` | Xem chi tiết 1 phương tiện |
| Cập nhật | PUT | `/{id}` | Sửa thông tin hoặc báo hỏng/bảo trì |
| Xóa xe | DELETE | `/{id}` | Xóa phương tiện khỏi hệ thống |

---

## LUỒNG TEST ĐẦY ĐỦ

### Bước 0️⃣: Chuẩn bị
1. Đăng nhập với tài khoản **MANAGER** hoặc **ADMIN**
2. Vào trang: `/manager/vehicles`

---

### Bước 1️⃣: Thêm phương tiện mới (Happy Path)

**Mục tiêu**: Nhập 2 phương tiện vào kho

#### Test Case 1.1: Thêm Cano
1. Click button **"Thêm phương tiện"**
2. Điền form:
   - Tên: `Cano C-01`
   - Loại: `BOAT`
   - Biển số: `SG-1234`
   - Sức chứa: `10`
   - Trạng thái: `AVAILABLE` (mặc định)
3. Click **"Tạo mới"**

**Kết quả mong đợi**:
- ✅ Modal đóng lại
- ✅ Danh sách refresh, hiển thị "Cano C-01" với status badge màu xanh "Sẵn sàng"
- ✅ Icon thuyền màu xanh dương hiển thị

#### Test Case 1.2: Thêm Xe Tải
1. Click **"Thêm phương tiện"**
2. Điền form:
   - Tên: `Xe Tải T-01`
   - Loại: `TRUCK`
   - Biển số: `59C-999.99`
   - Sức chứa: `2000`
   - Trạng thái: `AVAILABLE`
3. Submit

**Kết quả**: Xe tải xuất hiện trong danh sách với icon xe tải màu xám

---

### Bước 2️⃣: Xem danh sách và thống kê

**Kiểm tra:**
- Stats card hiển thị:
  - Tổng phương tiện: **02**
  - Sẵn sàng: **02**
  - Đang hoạt động: **00**
  - Cần bảo trì: **00**
- Grid hiển thị 2 cards: Cano C-01 và Xe Tải T-01

---

### Bước 3️⃣: Cập nhật thông tin (Sửa lỗi nhập liệu)

**Scenario**: Manager phát hiện nhập sai biển số xe tải

1. Hover vào card **"Xe Tải T-01"**
2. Click icon **Edit (bút chì)**
3. Sửa biển số: `59C-888.88`
4. Các trường khác giữ nguyên
5. Click **"Lưu thay đổi"**

**Kết quả mong đợi**:
- ✅ Biển số cập nhật thành `59C-888.88`
- ✅ Status vẫn là AVAILABLE (không đổi)

---

### Bước 4️⃣: Báo hỏng / Chuyển sang Bảo trì (Happy Path)

**Scenario**: Cano C-01 bị hỏng động cơ

1. Click Edit trên card **"Cano C-01"**
2. Chỉ thay đổi **Trạng thái** → `MAINTENANCE`
3. Submit

**Kết quả**:
- ✅ Status badge chuyển sang màu cam "Bảo trì"
- ✅ Stats "Cần bảo trì" tăng lên 1
- ✅ Stats "Sẵn sàng" giảm xuống 1

---

### Bước 5️⃣: Test Logic Chặn (Validation Rule) ⚠️

**Mục tiêu**: Kiểm tra hệ thống chặn không cho sửa status khi xe đang IN_USE

#### Setup: Tạo xe đang hoạt động
1. Click **"Thêm phương tiện"**
2. Điền:
   - Tên: `Trực thăng H-01`
   - Loại: `HELICOPTER`
   - Biển số: `VN-8888`
   - Sức chứa: `6`
   - Trạng thái: **`IN_USE`** (chọn trước để giả lập xe đang bay)
3. Submit

**Kết quả**: Xe được tạo với status badge màu xanh dương "Đang làm nhiệm vụ"

#### Test Validation
1. Click Edit trên **"Trực thăng H-01"**
2. **Quan sát**:
   - ⚠️ **Warning box màu vàng** xuất hiện phía trên form:
     > "Lưu ý quan trọng: Phương tiện này đang IN_USE (Đang làm nhiệm vụ). 
     > Bạn có thể sửa thông tin cơ bản, nhưng không thể thay đổi trạng thái..."
   - 🔒 Dropdown **"Trạng thái"** bị **disable** (mờ đi, không click được)
   - Text hiển thị: "🔒 Bị khóa vì xe đang hoạt động"

3. Thử sửa **Tên** thành `Trực thăng H-01 (Cập nhật)`
4. Click **"Lưu thay đổi"**

**Kết quả mong đợi**:
- ✅ Tên được cập nhật thành công
- ✅ Status vẫn giữ nguyên là **IN_USE** (không thay đổi được)

#### Test Backend Validation (Nếu bypass UI)
Nếu bạn dùng **Postman** hoặc **DevTools** để bypass UI và gửi PUT request:

```json
PUT /api/manager/vehicles/{id_truc_thang}
{
  "status": "MAINTENANCE"
}
```

**Kết quả backend**:
- ❌ Status Code: **400** hoặc **500**
- ❌ Error message: `"Không thể thay đổi trạng thái khi xe đang được sử dụng (IN_USE)..."`
- ✅ Frontend hiển thị error trong banner màu đỏ

---

### Bước 6️⃣: Xóa phương tiện

**Scenario**: Thanh lý xe cũ

1. Click icon **Trash (thùng rác)** trên card bất kỳ
2. Confirm dialog xuất hiện: "Bạn có chắc chắn muốn xóa phương tiện này?"
3. Click **OK**

**Kết quả**:
- ✅ Xe biến mất khỏi danh sách
- ✅ Stats cập nhật (Tổng phương tiện giảm 1)

---

### Bước 7️⃣: Test Validation "Tên trùng"

**Scenario**: Thử tạo 2 xe cùng tên

1. Tạo xe mới với tên: `Cano C-01` (trùng với xe đã tạo ở bước 1)
2. Submit

**Kết quả mong đợi**:
- ❌ Backend trả về lỗi **400** hoặc **409** (Conflict)
- ❌ Error banner màu đỏ hiển thị: "Tên phương tiện đã tồn tại" (hoặc tương tự)
- ✅ Modal vẫn mở, dữ liệu form giữ nguyên để user sửa

---

## CHECKLIST KIỂM TRA UI/UX

### ✅ Giao diện
- [ ] Glassmorphism background với blobs gradient
- [ ] Stats cards với icon và số đếm hiển thị đúng
- [ ] Vehicle cards hiển thị icon phù hợp với type (Ship/Truck/Plane/Activity/Bus)
- [ ] Status badges với màu sắc đúng:
  - Xanh lá (AVAILABLE)
  - Xanh dương (IN_USE)
  - Cam (MAINTENANCE)
  - Đỏ (UNAVAILABLE)
- [ ] Hover effect trên cards (scale + shadow)

### ✅ Chức năng
- [ ] Loading spinner khi fetch data
- [ ] Error banner hiển thị khi API lỗi
- [ ] Empty state hiển thị khi chưa có xe nào
- [ ] Modal mở/đóng mượt mà
- [ ] Form validation (required fields)
- [ ] Confirmation dialog trước khi xóa

### ✅ Business Logic
- [ ] Không sửa được status khi IN_USE (UI disabled)
- [ ] Warning message hiển thị khi edit xe IN_USE
- [ ] Backend reject nếu bypass UI validation
- [ ] Stats tự động cập nhật sau CRUD
- [ ] Danh sách refresh sau create/update/delete

---

## TROUBLESHOOTING

### ❌ Lỗi: "Không thể tải danh sách phương tiện"
**Nguyên nhân**: Backend chưa chạy hoặc CORS issue
**Giải pháp**:
1. Kiểm tra backend server đang chạy ở port đúng
2. Kiểm tra `axiosClient.js` có đúng baseURL không
3. Kiểm tra token JWT còn hiệu lực không

### ❌ Lỗi: API trả về 401 Unauthorized
**Nguyên nhân**: Token hết hạn hoặc không có quyền
**Giải pháp**: Đăng xuất và đăng nhập lại với tài khoản MANAGER/ADMIN

### ❌ Lỗi: Không disable được status dropdown khi IN_USE
**Nguyên nhân**: Logic check `editingVehicle.status === 'IN_USE'` bị sai
**Giải pháp**: Kiểm tra data từ API trả về có đúng structure không

---

## GHI CHÚ QUAN TRỌNG

1. **Partial Update**: API PUT cho phép gửi chỉ các trường cần sửa (các trường null sẽ giữ nguyên giá trị cũ)
2. **Auto Detach Team**: Khi chuyển sang MAINTENANCE/UNAVAILABLE, backend tự động ngắt liên kết với Rescue Team
3. **Unique Name**: Tên phương tiện phải unique toàn hệ thống (backend enforce)
4. **Default Status**: Khi tạo mới mà không truyền status, backend sẽ set mặc định là AVAILABLE

---

**Hoàn thành test guide vào**: 2026-02-24  
**Version**: 1.0  
**Tested by**: [Your Name]
