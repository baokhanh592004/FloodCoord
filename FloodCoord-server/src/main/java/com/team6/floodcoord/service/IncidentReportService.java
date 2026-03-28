package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateIncidentRequest;
import com.team6.floodcoord.dto.request.ResolveIncidentRequest;
import com.team6.floodcoord.dto.response.IncidentReportResponse;
import com.team6.floodcoord.model.User;

import java.util.UUID;

import java.util.List;

public interface IncidentReportService {
    void createIncidentReport(CreateIncidentRequest request, User leader);
    void resolveIncident(Long incidentId, ResolveIncidentRequest resolveRequest, User coordinator);
    List<IncidentReportResponse> getPendingIncidents();
    List<IncidentReportResponse> getAllIncidents();
    IncidentReportResponse getLatestIncidentByRequest(UUID requestId, User requester);
}
