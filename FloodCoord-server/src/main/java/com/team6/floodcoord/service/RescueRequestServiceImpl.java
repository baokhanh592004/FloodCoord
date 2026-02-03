package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.CreateRescueRequestDTO;
import com.team6.floodcoord.dto.request.LocationDTO;
import com.team6.floodcoord.dto.request.MediaDTO;
import com.team6.floodcoord.dto.response.RequestLocationResponse;
import com.team6.floodcoord.dto.response.RequestMediaResponse;
import com.team6.floodcoord.dto.response.RescueRequestDetailResponse;
import com.team6.floodcoord.dto.response.RescueRequestSummaryResponse;
import com.team6.floodcoord.model.RequestLocation;
import com.team6.floodcoord.model.RequestMedia;
import com.team6.floodcoord.model.RescueRequest;
import com.team6.floodcoord.model.User;
import com.team6.floodcoord.repository.RequestLocationRepository;
import com.team6.floodcoord.repository.RequestMediaRepository;
import com.team6.floodcoord.repository.RescueRequestRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RescueRequestServiceImpl implements RescueRequestService {

    private final RescueRequestRepository requestRepo;
    private final RequestLocationRepository locationRepo;
    private final RequestMediaRepository mediaRepo;

    public RescueRequestServiceImpl(
            RescueRequestRepository requestRepo,
            RequestLocationRepository locationRepo,
            RequestMediaRepository mediaRepo) {
        this.requestRepo = requestRepo;
        this.locationRepo = locationRepo;
        this.mediaRepo = mediaRepo;
    }

    @Override
    public UUID createRescueRequest(CreateRescueRequestDTO dto, User currentUser) {

        // 1. tạo rescue request
        RescueRequest request = new RescueRequest();
        if (currentUser != null) {
            request.setCitizen(currentUser);
        } else {
            request.setCitizen(null); // anonymous citizen
        }
//        request.setCitizen(currentUser);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setEmergencyLevel(dto.getEmergencyLevel());
        request.setPeopleCount(dto.getPeopleCount());
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        request.setContactName(dto.getContactName());
        request.setContactPhone(dto.getContactPhone());

        requestRepo.save(request);

        // 2. lưu location
        LocationDTO loc = dto.getLocation();
        RequestLocation location = new RequestLocation();
        location.setRequest(request);
        location.setLatitude(loc.getLatitude());
        location.setLongitude(loc.getLongitude());
        location.setAddressText(loc.getAddressText());
        location.setFloodDepth(loc.getFloodDepth());

        locationRepo.save(location);

        // 3. lưu media (nếu có)
        if (dto.getMediaUrls() != null && !dto.getMediaUrls().isEmpty()) {
            for (MediaDTO m : dto.getMediaUrls()) {
                RequestMedia media = new RequestMedia();
                media.setRequest(request);
                media.setMediaType(m.getMediaType());
                media.setMediaUrl(m.getMediaUrl());
                media.setUploadedAt(LocalDateTime.now());
                mediaRepo.save(media);
            }
        }

        return request.getRequestId();
    }
    @Override
    public List<RescueRequestSummaryResponse> getAllRescueRequests() {
        return requestRepo.findAll().stream()
                .map(this::mapToSummary)
                .toList();
    }

    @Override
    public RescueRequestDetailResponse getRequestDetail(UUID requestId) {
        RescueRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Rescue request not found"));

        RescueRequestDetailResponse dto = new RescueRequestDetailResponse();
        dto.setRequestId(request.getRequestId());
        dto.setTitle(request.getTitle());
        dto.setDescription(request.getDescription());
        dto.setEmergencyLevel(request.getEmergencyLevel());
        dto.setStatus(request.getStatus());
        dto.setPeopleCount(request.getPeopleCount());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setCitizenName(
                request.getCitizen() != null ? request.getCitizen().getFullName() : null
        );

        // 📍 Location
        if (request.getLocation() != null) {
            RequestLocationResponse loc = new RequestLocationResponse();
            loc.setLatitude(request.getLocation().getLatitude());
            loc.setLongitude(request.getLocation().getLongitude());
            loc.setAddressText(request.getLocation().getAddressText());
            loc.setFloodDepth(request.getLocation().getFloodDepth());
            dto.setLocation(loc);
        }

        // 🖼️ Media
        if (request.getMediaList() != null) {
            List<RequestMediaResponse> mediaList = request.getMediaList().stream().map(m -> {
                RequestMediaResponse media = new RequestMediaResponse();
                media.setMediaId(m.getMediaId());
                media.setMediaType(m.getMediaType());
                media.setMediaUrl(m.getMediaUrl());
                media.setUploadedAt(m.getUploadedAt());
                return media;
            }).toList();

            dto.setMedia(mediaList);
        }

        return dto;
    }


    private RescueRequestSummaryResponse mapToSummary(RescueRequest request) {
        RescueRequestSummaryResponse dto = new RescueRequestSummaryResponse();
        dto.setRequestId(request.getRequestId());
        dto.setTitle(request.getTitle());
        dto.setEmergencyLevel(request.getEmergencyLevel());
        dto.setStatus(request.getStatus());
        dto.setPeopleCount(request.getPeopleCount());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setContactName(request.getContactName());
        dto.setContactPhone(request.getContactPhone());
        return dto;
    }
}