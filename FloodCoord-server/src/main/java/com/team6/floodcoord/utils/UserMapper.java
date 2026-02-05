package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.User;

public class UserMapper {
    public static UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .status(user.getStatus())
                .build();

        if (user.getRole() != null) {
            response.setRoleName(user.getRole().getRoleName());
        }

        return response;
    }
}
