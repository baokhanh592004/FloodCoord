package com.team6.floodcoord.repository.jpa;



import com.team6.floodcoord.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {

    Optional<Attendance> findByRescueRequest_RequestIdAndMember_Id(
            UUID requestId,
            Long memberId
    );

    List<Attendance> findByRescueRequest_RequestId(UUID requestId);
}
