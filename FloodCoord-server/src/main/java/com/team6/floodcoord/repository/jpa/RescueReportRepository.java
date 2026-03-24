package com.team6.floodcoord.repository.jpa;


import com.team6.floodcoord.model.RescueReport;
import com.team6.floodcoord.model.RescueRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RescueReportRepository extends JpaRepository<RescueReport, Long> {

    // check xem request đã có report chưa
    Optional<RescueReport> findByRequest_RequestId(UUID requestId);

    // check bằng object
    Optional<RescueReport> findByRequest(RescueRequest request);

}