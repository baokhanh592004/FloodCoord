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

    @ManyToOne
    @JoinColumn(name = "request_id")
    private RescueRequest request;

    private String mediaType;
    private String mediaUrl;

    private LocalDateTime uploadedAt;
}
