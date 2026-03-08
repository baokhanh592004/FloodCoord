package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.response.RoleResponse;
import com.team6.floodcoord.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService{
    private final RoleRepository roleRepository;

    @Override
    public List<RoleResponse> getAllRoles() {
        // Lấy tất cả từ DB và chuyển đổi (map) sang danh sách RoleResponse
        return roleRepository.findAll().stream()
                .map(role -> RoleResponse.builder()
                        .id(role.getRoleId())
                        .roleName(role.getRoleName())
                        .roleCode(role.getRoleCode())
                        .description(role.getRoleDescription())
                        .build())
                .collect(Collectors.toList());
    }
}
