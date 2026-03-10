package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
    boolean existsByName(String name);

    Optional<RescueTeam> findByLeader_Id(Long leaderId);


}
