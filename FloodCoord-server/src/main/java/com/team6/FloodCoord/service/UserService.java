package com.team6.floodcoord.service;

import com.team6.floodcoord.dto.request.UserRequest;
import com.team6.floodcoord.dto.response.UserResponse;

public interface UserService {
    UserResponse createUser(UserRequest request);
}
