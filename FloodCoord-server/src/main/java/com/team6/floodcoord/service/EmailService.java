package com.team6.floodcoord.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}
