package com.team6.floodcoord.service;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.JwtInfo;
import com.team6.floodcoord.dto.TokenPayLoad;
import com.team6.floodcoord.model.User;

import java.text.ParseException;

public interface JwtService {
    TokenPayLoad generateAccessToken(User user);
    TokenPayLoad generateRefreshToken(User user);
    boolean verifyToken(String token) throws ParseException, JOSEException;
    boolean verifyToken(String token, boolean checkBlacklist) throws ParseException, JOSEException;
    JwtInfo parseToken(String token) throws ParseException;
}
