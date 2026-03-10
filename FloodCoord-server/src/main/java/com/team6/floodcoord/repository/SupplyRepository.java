package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.Supply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupplyRepository extends JpaRepository<Supply, Long> {
    boolean existsByName(String name);
    Optional<Supply> findByNameIgnoreCase(String name);
}
