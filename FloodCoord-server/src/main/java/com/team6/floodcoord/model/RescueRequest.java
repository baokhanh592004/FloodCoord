package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
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

    private String title;
    private String description;
    private String emergencyLevel;
    private String status;
    private int peopleCount;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "verified_by")
    private com.team6.floodcoord.model.User verifiedBy;
}
