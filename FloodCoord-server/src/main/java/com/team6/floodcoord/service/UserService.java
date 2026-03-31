package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.ProfileUpdateRequest;
import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.request.UserUpdateRequest;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    public UserResponse updateUser(Long id, UserUpdateRequest request);
    public List<UserResponse> getAllUsers();
    public void deleteUser(Long id);
    public UserResponse getUserById(Long id);
    UserResponse getMyProfile(User currentUser);
    UserResponse updateMyProfile(User currentUser, ProfileUpdateRequest request);
    List<UserResponse> getAvailableRescueMembers();
    byte[] generateExcelTemplate();
    void importUsersFromExcel(MultipartFile file);
}
