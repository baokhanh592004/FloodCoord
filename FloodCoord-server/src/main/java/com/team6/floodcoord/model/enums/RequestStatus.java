package com.team6.floodcoord.model.enums;

public enum RequestStatus {
    PENDING,        // 1. Mới gửi, chờ xác minh
    VERIFIED,       // 2. Đã xác minh, chờ điều phối (Approved)
    IN_PROGRESS,    // 3. Đã phân công, đội đang thực hiện (Assigned)

    MOVING,         // 4. Đội đang di chuyển đến hiện trường
    ARRIVED,        // 5. Đã đến nơi
    RESCUING,       // 6. Đang thực hiện cứu hộ

    COMPLETED,      // 7. Đã cứu hộ xong
    CANCELLED       // 8. Hủy (do spam hoặc không cần nữa)
}
