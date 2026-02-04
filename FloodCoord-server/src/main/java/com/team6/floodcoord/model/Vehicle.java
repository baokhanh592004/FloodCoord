package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.VehicleStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // VD: Cano-01

    @Column(nullable = false)
    private String type; // VD: BOAT, TRUCK

    private String licensePlate;

    private Integer capacity; // Sức chứa

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    // Quan hệ với RescueTeam (Để dành cho Phase sau)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_team_id")
    private RescueTeam currentTeam;
}
