package com.team6.floodcoord.service;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.request.ChangePasswordRequest;
import com.team6.floodcoord.dto.request.ForgotPasswordRequest;
import com.team6.floodcoord.dto.request.LoginRequest;
import com.team6.floodcoord.dto.request.ResetPasswordRequest;
import com.team6.floodcoord.dto.response.LoginResponse;

import java.text.ParseException;

public interface AuthenticationService {
    void logout(String token) throws ParseException;
    LoginResponse login(LoginRequest request);
    LoginResponse refreshToken(String refreshToken) throws ParseException, JOSEException;
    void changePassword(Long userId, ChangePasswordRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
