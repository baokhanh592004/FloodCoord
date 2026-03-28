# Tài liệu: Luồng Xử Lý Sự Cố Khi Đội Đã Xuất Phát (Post-Departure Incident Release Flow)

Tài liệu này giải thích chi tiết logic và luồng hoạt động của tính năng Xử lý sự cố trong trường hợp **"Đội đã xuất phát"**. 

---

## 1. Vấn đề hiện tại (Trước khi sửa)
Khi có sự cố (xe hỏng, thiếu người...) và Điều phối viên (Coordinator) quyết định **HỦY (ABORT)** và giao cho đội khác:
- Hệ thống mặc định giải phóng đội cũ về trạng thái **Sẵn sàng (AVAILABLE)**.
- Xe cũ được tự động thu hồi về kho, sẵn sàng cho đội khác nổ máy đi tiếp (**AVAILABLE**).
- Vật tư mang đi cũng được tự động hoàn lại toàn bộ vào kho.

**Lỗ hổng:** Nếu đội **đã đi ra ngoài đường rồi** mới gặp sự cố (bể lốp, tai nạn...), việc set xe thành `AVAILABLE` là vô lý vì xe thực tế đang nằm ngoài đường bị hỏng. Đội cũng chưa về trụ sở nên không thể set là `AVAILABLE`. Vật tư mang theo đi cũng không thể tự động quay lại kho.

---

## 2. Giải pháp (Logic mới đã được triển khai)

Chúng ta phân tách ra 2 trường hợp rạch ròi. Trên màn hình "Báo cáo sự cố" của Điều phối viên, có thêm một tuỳ chọn (checkbox): 
👉 **"Đội đã xuất phát khi sự cố xảy ra"**

### Trường hợp 1: CHECK (Đội đã xuất phát)
Đây là trường hợp đội đang chạy trên đường thì gặp sự cố. Khi Coordinator bấm **Xác nhận Hủy nhiệm vụ**, backend sẽ xử lý theo quy tắc mới:

1. **Với Đội cũ:** 
   * Trạng thái bị đổi thành **Đang nghỉ trực (OFF_DUTY)** thay vì Sẵn sàng.
   * *Ngụ ý:* Đội này đang trên đường về hoặc đang dừng chờ xử lý, chưa thể nhận việc khác.
2. **Với Xe liên quan:** 
   * Phương tiện lập tức bị cắt khỏi đội, và chuyển sang trạng thái **Đang bảo trì (MAINTENANCE)**.
   * *Ngụ ý:* Xe đang hỏng ngoài đường, kỹ thuật viên phải ra kéo hoặc sửa, không được cấp cho đội mới.
3. **Với Vật tư mang theo:** 
   * Xóa liên kết vật tư khỏi nhiệm vụ để giao cho đội mới, nhưng **KHÔNG CỘNG LẠI SỐ KIỂM KÊ** vào kho.
   * *Ngụ ý:* Vật tư xem như đã hao hụt hoặc đang nằm trên chiếc xe hỏng, kho trung tâm không có sẵn ngay vật tư này.
4. **Trang báo cáo cho Đội cũ:** 
   * App của Đội cũ (Mission Detail) hiện một banner màu cam báo hiệu *"Đội bạn đang nghỉ trực (OFF_DUTY)"*.
   * Có một nút: **"Gửi báo cáo tình trạng xe & vật tư"**. Trưởng đội bắt buộc phải sử dụng nút này để chụp ảnh xe hư, báo tổng kết vật tư còn lại để Coordinator nắm tình hình rồi mới giải phóng trạng thái thủ công thành Sẵn sàng sau.

*(Bất kể Coordinator có giao nhiệm vụ ngay cho Đội mới, hay quăng nhiệm vụ về Hàng chờ, thì 4 điều trên với Đội cũ vẫn không thay đổi).*

### Trường hợp 2: KHÔNG CHECK (Đội chưa xuất phát)
Giữ nguyên logic cũ. Áp dụng cho trường hợp đội đang tập hợp ở trụ sở, thấy xe xịt lốp hoặc thiếu người dĩ nhiên Hủy.
1. **Đội cũ:** Trả về **AVAILABLE**.
2. **Xe cũ:** Trả về **AVAILABLE** (hoặc Coordinator chủ động chọn gửi đi Bảo trì).
3. **Vật tư cũ:** Hoàn toàn bộ số lượng thực tế lại kho.

---

## 3. Luồng đi Code (Code Flow)

Để hoàn thiện được luồng trên, hệ thống đã được sửa đổi ở cả **Backend** và **Frontend** như sau:

### Tầng Backend (Server)

1. **`ResolveIncidentRequest.java` (DTO)**: 
   * Thêm trường `Boolean isPostDeparture;` để Frontend gửi lên thông tin Coordinator có tick chọn checkbox hay không.
2. **`IncidentReport.java` (Model)**: 
   * Thêm cột `is_post_departure` trong database để lưu lại lịch sử rằng sự cố này xảy ra lúc đội đã xuất phát hay chưa.
3. **`IncidentReportServiceImpl.java`**:
   * Cập nhật hàm `resolveIncident`: Đọc biến `isPostDeparture`. 
   * Nếu là `true` -> Code chạy vào luồng 1: Lưu status `OFF_DUTY` cho đội, `MAINTENANCE` cho xe, không tăng tồn kho `Supply`.
   * Cập nhật hàm `mapToResponse`: Đẩy cờ `isPostDeparture` ra API để Frontend biết render giao diện.
   * Thêm logic lưu lại note vào lịch sử Task (Mission) để đánh dấu chính xác lý do chuyển quân.

### Tầng Frontend (Client)

1. **Trang Coordinator > IncidentReportsPage (**`IncidentReportsPage.jsx`**)**:
   * Chèn một Checkbox: *"Đội đã xuất phát khi sự cố xảy ra"* vào Box Xử lý sự cố.
   * Cập nhật khung **"Kết quả sau khi xác nhận" (SummaryPreview)** biến đổi dynamically theo checkbox này, báo cho Coordinator biết: xe sẽ thành bảo trì, vật tư sẽ bị giữ lại, đội thành OFF DUTY.
   * Gửi trường `isPostDeparture` cùng các tham số khác về Backend thông qua hàm `resolveIncident`.
2. **Trang Rescue Team > MissionDetail (**`MissionDetail.jsx`**)**:
   * Sửa logic Banner cảnh báo. Khi load lên phát hiện Nhiệm vụ đã bị Hủy(`ABORT`) bởi Coordinator:
   * Nếu `isPostDeparture == true` -> Hiện Banner mầu cam *"Đội đang nghỉ trực (OFF_DUTY)"*. Ngược lại, hiện màn hình Đỏ thông báo đã huỷ như bình thường.
   * Chèn thêm nút *"Gửi báo cáo tình trạng xe & vật tư"* cho trường hợp mầu cam.
3. **Màn hình mới: Báo cáo Tình trạng (**`StandbyStatusReport.jsx`**)**:
   * Tạo màn hình mới cho phép Đội cũ nhập các thông tin: *Vị trí đang ở đâu*, *Tình trạng xe hỏng thế nào*, *Vật tư trên xe còn hay đã tiêu phung phí*.
   * Xài lại API cũ: Gọi hàm `createIncident` nhúng Title vào format `[STATUS_REPORT]...`.
   * Khai báo trong AppRoutes Route mới `/rescue-team/missions/:id/standby-report`.
