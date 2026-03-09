package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rescue_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "request_id", nullable = false)
    private RescueRequest request;

    @ManyToOne
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    private Integer rescuedPeople;

    @Column(length = 1000)
    private String reportNote;

    private LocalDateTime reportedAt;
}