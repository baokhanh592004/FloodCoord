package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.request.UserUpdateRequest;
import com.team6.floodcoord.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);

    public UserResponse updateUser(Long id, UserUpdateRequest request);
    public List<UserResponse> getAllUsers();
    public void deleteUser(Long id);
    public UserResponse getUserById(Long id);
}
