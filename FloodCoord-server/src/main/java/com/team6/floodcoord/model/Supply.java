package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.SupplyType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // VD: Mì tôm Hảo Hảo, Áo phao loại 1

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SupplyType type;

    @Column(nullable = false)
    private Integer quantity; // Số lượng tồn kho

    @Column(nullable = false)
    private String unit; // Đơn vị tính: Thùng, Cái, Hộp, Chai

    private String description; // Ghi chú thêm (Hạn sử dụng, nơi cất giữ...)

    @Column(name = "imported_date")
    private LocalDateTime importedDate; // Ngày nhập kho

    @Column(name = "exported_date")
    private LocalDateTime exportedDate; // Ngày xuất kho (dự kiến hoặc thực tế)

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;   // Hạn sử dụng
}
