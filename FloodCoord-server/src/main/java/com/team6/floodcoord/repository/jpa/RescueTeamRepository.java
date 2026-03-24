package com.team6.floodcoord.repository.jpa;

import com.team6.floodcoord.model.RescueTeam;
import com.team6.floodcoord.model.enums.TeamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
    boolean existsByName(String name);

    Optional<RescueTeam> findByLeader_Id(Long leaderId);

    List<RescueTeam> findByStatus(TeamStatus status);
}
