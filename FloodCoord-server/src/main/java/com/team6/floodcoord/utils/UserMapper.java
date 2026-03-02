package com.team6.floodcoord.utils;

import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.User;
import org.springframework.stereotype.Component;

@Component
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

        // Map RescueTeam (Dành cho thành viên đội cứu hộ)
        if (user.getRescueTeam() != null) {
            response.setTeamId(user.getRescueTeam().getId());
            response.setTeamName(user.getRescueTeam().getName());

            // Kiểm tra xem user này có phải là đội trưởng không
            boolean isLeader = user.getRescueTeam().getLeader() != null
                    && user.getRescueTeam().getLeader().getId().equals(user.getId());
            response.setIsTeamLeader(isLeader);
        } else {
            response.setIsTeamLeader(false);
        }

        return response;
    }
}
