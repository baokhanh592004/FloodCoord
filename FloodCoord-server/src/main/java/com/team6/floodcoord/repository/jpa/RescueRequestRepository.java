package com.team6.floodcoord.repository.jpa;

import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.model.enums.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RescueRequestRepository
        extends JpaRepository<RescueRequest, UUID> {
    Optional<RescueRequest> findByTrackingCode(String trackingCode);

    @Query("SELECT r FROM RescueRequest r WHERE (:status IS NULL OR r.status = :status)")
    Page<RescueRequest> findAllByStatusOptional(@Param("status") RequestStatus status, Pageable pageable);

    List<RescueRequest> findByAssignedTeam_IdAndStatusIn(
            Long teamId,
            List<RequestStatus> statuses
    );

    List<RescueRequest> findByAssignedTeam_Id(Long teamId);

    List<RescueRequest> findByTrackingCodeInAndCitizenIsNull(List<String> trackingCodes);

    List<RescueRequest> findByContactPhoneAndCitizenIsNull(
            String contactPhone
    );

    List<RescueRequest> findByCitizen_Id(Long citizenId);

    Optional<RescueRequest> findByTrackingCodeAndContactPhoneAndCitizenIsNull(String trackingCode, String contactPhone);
    List<RescueRequest> findByStatus(RequestStatus status);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
