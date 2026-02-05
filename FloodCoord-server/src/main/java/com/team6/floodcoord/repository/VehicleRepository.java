package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByName(String name);
    boolean existsByLicensePlate(String licensePlate);
}
