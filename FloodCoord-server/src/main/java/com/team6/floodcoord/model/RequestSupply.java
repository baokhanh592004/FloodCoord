package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "request_supplies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestSupply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private RescueRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supply_id")
    private Supply supply;

    private Integer quantity;
}
