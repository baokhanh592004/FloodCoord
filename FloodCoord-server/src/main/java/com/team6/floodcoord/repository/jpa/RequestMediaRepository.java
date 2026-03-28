package com.team6.floodcoord.repository.jpa;

import com.team6.floodcoord.model.RequestMedia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RequestMediaRepository
        extends JpaRepository<RequestMedia, UUID> {
}