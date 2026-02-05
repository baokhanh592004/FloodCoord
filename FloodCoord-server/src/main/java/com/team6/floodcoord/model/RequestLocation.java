package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "request_locations")
@Data
public class RequestLocation {

    @Id
    @GeneratedValue
    private UUID locationId;

    @OneToOne
    @JoinColumn(name = "request_id")
    private RescueRequest request;

    private Double latitude;
    private Double longitude;
    private String addressText;
    private Float floodDepth;
}
