package com.team6.floodcoord.repository.jpa;

import com.team6.floodcoord.model.IncidentReport;
import com.team6.floodcoord.model.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentReportRepository extends JpaRepository<IncidentReport, Long> {
    List<IncidentReport> findByRescueRequest_RequestId(UUID requestId);
    List<IncidentReport> findByRescueRequest_RequestIdOrderByCreatedAtDesc(UUID requestId);
    List<IncidentReport> findByStatus(IncidentStatus status);
    List<IncidentReport> findByStatusOrderByCreatedAtDesc(IncidentStatus status);
    List<IncidentReport> findAllByOrderByCreatedAtDesc();
}

