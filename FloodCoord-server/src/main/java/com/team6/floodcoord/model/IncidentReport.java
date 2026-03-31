package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.IncidentAction;
import com.team6.floodcoord.model.enums.IncidentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "incident_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rescue_request_id", nullable = false)
    private RescueRequest rescueRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy; // Leader của team

    @Column(length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "incident_media", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "image_url")
    private List<String> images;

    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    // Phản hồi từ Coordinator
    @Column(columnDefinition = "TEXT")
    private String coordinatorResponse;

    @Enumerated(EnumType.STRING)
    private IncidentAction coordinatorAction; // Quyết định cuối cùng (CONTINUE hay ABORT)

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    /**
     * true = coordinator xác nhận đội đã xuất phát khi xử lý ABORT
     * → Đội cũ OFF_DUTY, xe MAINTENANCE, vật tư không hoàn lại kho
     */
    @Builder.Default
    @Column(name = "is_post_departure")
    private Boolean isPostDeparture = false;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
