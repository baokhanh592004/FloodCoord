package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "report_media")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String mediaUrl;

    private String mediaType; // IMAGE hoặc VIDEO
    @ManyToOne
    @JoinColumn(name = "report_id")
    private RescueReport report;
}
