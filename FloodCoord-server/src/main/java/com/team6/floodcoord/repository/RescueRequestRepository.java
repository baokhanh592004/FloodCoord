package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.RescueRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RescueRequestRepository
        extends JpaRepository<RescueRequest, UUID> {
    Optional<RescueRequest> findByTrackingCode(String trackingCode);
}