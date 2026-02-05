package com.team6.floodcoord.repository;


import com.team6.floodcoord.model.RequestLocation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
public interface RequestLocationRepository
        extends JpaRepository<RequestLocation, UUID> {
}