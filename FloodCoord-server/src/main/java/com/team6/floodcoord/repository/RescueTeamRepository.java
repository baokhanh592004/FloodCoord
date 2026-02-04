package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {
    boolean existsByName(String name);
}
