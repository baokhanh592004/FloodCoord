package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "request_media")
@Data
public class RequestMedia {

    @Id
    @GeneratedValue
    private UUID mediaId;

    @ManyToOne(fetch = FetchType.LAZY) //mới thêm để test nếu có lỗi còn xóa
    @JoinColumn(name = "request_id")
    private RescueRequest request;

    private String mediaType;
    @Column(nullable = false, length = 1000)
    private String mediaUrl;

    private LocalDateTime uploadedAt;
}
