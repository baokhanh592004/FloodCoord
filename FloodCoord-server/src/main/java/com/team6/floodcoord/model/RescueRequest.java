package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rescue_requests")
@Data
public class RescueRequest {

    @Id
    @GeneratedValue
    private UUID requestId;

    @ManyToOne
    @JoinColumn(name = "citizen_id")
    private com.team6.floodcoord.model.User citizen;

    @Column(length = 500)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(length = 50)
    private String emergencyLevel;

    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    private int peopleCount;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id")
    private RescueTeam assignedTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_vehicle_id")
    private Vehicle assignedVehicle;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL)
    private List<RequestSupply> supplies;

    @Column(name = "coordinator_note", columnDefinition = "TEXT")
    private String coordinatorNote;

    @Column(name = "tracking_code", unique = true, nullable = false, length = 50)
    private String trackingCode; // Mã để tra cứu (VD: 8X29SA)

    @Column(name = "contact_name", nullable = false, length = 200)
    private String contactName;  // Tên người báo tin

    @Column(name = "contact_phone", nullable = false, length = 20)
    private String contactPhone; // SĐT để Coordinator gọi xác minh

    @Column(name = "citizen_feedback", columnDefinition = "TEXT")
    private String citizenFeedback; // Lời cảm ơn hoặc góp ý của người dân

    @Column(name = "citizen_rating")
    private Integer citizenRating;  // Đánh giá sao (1-5)

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // Thời gian hoàn thành/đóng hồ sơ

    @OneToOne(mappedBy = "request", cascade = CascadeType.ALL)
    private RequestLocation location;

    // 🔹 Media (1 - N)
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL)
    private List<RequestMedia> mediaList;

    @OneToOne(mappedBy = "request")
    private RescueReport report;
}
