package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.RequestSupply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RequestSupplyRepository extends JpaRepository<RequestSupply, Long> {

    Optional<RequestSupply> findByRequest_RequestIdAndSupply_Id(
            UUID requestId,
            Long supplyId);
}
