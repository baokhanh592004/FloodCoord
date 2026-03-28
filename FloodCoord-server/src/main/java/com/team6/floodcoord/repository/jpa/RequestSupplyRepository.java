package com.team6.floodcoord.repository.jpa;

import com.team6.floodcoord.model.RequestSupply;
import com.team6.floodcoord.model.RescueRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RequestSupplyRepository extends JpaRepository<RequestSupply, Long> {

    Optional<RequestSupply> findByRequest_RequestIdAndSupply_Id(
            UUID requestId,
            Long supplyId);

    List<RequestSupply> findByRequest(RescueRequest rescueRequest);

    @Query("SELECT COALESCE(SUM(rs.quantity), 0) FROM RequestSupply rs WHERE rs.request.createdAt BETWEEN :start AND :end")
    Long sumSupplyQuantityByDateRange(@Param("start") java.time.LocalDateTime start, @Param("end") java.time.LocalDateTime end);
}
