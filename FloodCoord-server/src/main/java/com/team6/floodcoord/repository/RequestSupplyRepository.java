package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.RequestSupply;
import com.team6.floodcoord.model.RescueRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RequestSupplyRepository extends JpaRepository<RequestSupply, Long> {

    Optional<RequestSupply> findByRequest_RequestIdAndSupply_Id(
            UUID requestId,
            Long supplyId);

    List<RequestSupply> findByRequest(RescueRequest rescueRequest);
}
