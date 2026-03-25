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
    long countByStatusAndCompletedAtBetween(RequestStatus status, LocalDateTime start, LocalDateTime end);

    // 1. Đếm số nhiệm vụ hoàn thành của Đội
    long countByAssignedTeam_IdAndStatusAndCompletedAtBetween(Long teamId, RequestStatus status, java.time.LocalDateTime start, java.time.LocalDateTime end);

    // 2. Tính tổng số người cứu được của Đội (Lấy từ RescueReport)
    // LƯU Ý: Chữ "rescuedPeople" dưới đây bạn phải sửa lại cho ĐÚNG VỚI TÊN BIẾN trong file RescueReport.java của bạn nhé.
    @Query("SELECT COALESCE(SUM(r.report.rescuedPeople), 0) FROM RescueRequest r WHERE r.assignedTeam.id = :teamId AND r.status = :status AND r.completedAt BETWEEN :start AND :end")
    Long sumRescuedPeopleByTeamAndDateRange(@Param("teamId") Long teamId, @Param("status") RequestStatus status, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);

    // 3. Tính điểm đánh giá sao trung bình của Đội
    @Query("SELECT COALESCE(AVG(r.citizenRating), 0.0) FROM RescueRequest r WHERE r.assignedTeam.id = :teamId AND r.status = :status AND r.completedAt BETWEEN :start AND :end AND r.citizenRating IS NOT NULL")
    Double getAverageRatingByTeamAndDateRange(@Param("teamId") Long teamId, @Param("status") RequestStatus status, @Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
