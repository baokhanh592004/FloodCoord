package com.team6.floodcoord.service;

import com.nimbusds.jose.JOSEException;
import com.team6.floodcoord.dto.JwtInfo;
import com.team6.floodcoord.dto.TokenPayLoad;
import com.team6.floodcoord.dto.request.*;
import com.team6.floodcoord.dto.response.LoginResponse;
import com.team6.floodcoord.dto.response.UserResponse;
import com.team6.floodcoord.model.*;
import com.team6.floodcoord.repository.*;
import com.team6.floodcoord.utils.PasswordUtils;
import com.team6.floodcoord.utils.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService{

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final BlacklistedAccessTokenRepository blacklistedAccessTokenRepository;
    private final ValidRefreshTokenRepository validRefreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int PASSWORD_RESET_TOKEN_VALIDITY_MINUTES = 5;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private final EmailService emailService;
    private final RoleRepository roleRepository;

    @Override
    public void logout(String token) throws ParseException {
        log.info("Processing logout request");

        JwtInfo jwtInfo = jwtService.parseToken(token);
        String jwtId = jwtInfo.getJwtId();
        Date expiredTime = jwtInfo.getExpiredTime();

        long ttlSeconds = (expiredTime.getTime() - System.currentTimeMillis()) / 1000;
        if (ttlSeconds <= 0 ){
            log.info("Token already expired, no need to blacklist.");
            return;
        }

        // Add access token to blacklist in Redis
        BlackListedAccessToken blacklistedToken = BlackListedAccessToken.builder()
                .jwtId(jwtId)
                .timeToLiveSeconds(ttlSeconds)
                .build();
        blacklistedAccessTokenRepository.save(blacklistedToken);

        log.info("Logout successful - Access token blacklisted with TTL: {} seconds", ttlSeconds);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        //Find user to check lock status first
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new BadCredentialsException("Invalid email or password"));

        //Check if the account is locked
        if (!user.isAccountNonLocked()){
            //Calculate remaining time (Optional: to display detailed notification)
            long minutesLeft = 30 - java.time.Duration.between(user.getLockTime(), LocalDateTime.now()).toMinutes();
            throw new LockedException("Account is locked due to 5 failed attempts. Please try again in: " + minutesLeft + "minutes.");
        }

        //CHECK PASSWORD EXPIRED (90 DAYS)
        if (!user.isCredentialsNonExpired()){
            throw new CredentialsExpiredException("Password has expired. Please change your password.");
        }

        try {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());
            Authentication authentication = authenticationManager.authenticate(authToken);

            //login successfully -> reset counter
            if ((user.getFailedLoginAttempts() != null && user.getFailedLoginAttempts() > 0) || user.getLockTime() != null){
                user.setFailedLoginAttempts(0);
                user.setLockTime(null);
                userRepository.save(user);
            }

            user = (User) authentication.getPrincipal();
            log.info("User authenticated successfully: {}", user.getEmail());

            //generate tokens
            TokenPayLoad accessPayload = jwtService.generateAccessToken(user);
            TokenPayLoad refreshPayload = jwtService.generateRefreshToken(user);

            //save refresh tokens
            ValidRefreshToken refreshToken = ValidRefreshToken.builder()
                    .jwtId(refreshPayload.getJwtId())
                    .user(user)
                    .expiredTime(LocalDateTime.ofInstant(refreshPayload.getExpiredTime().toInstant(), ZoneId.systemDefault()))
                    .revoked(false)
                    .build();

            return LoginResponse.builder()
                    .accessToken(accessPayload.getToken())
                    .refreshToken(refreshPayload.getToken())
                    .build();
        } catch (AuthenticationException e) {
            if (e instanceof BadCredentialsException){
                int currentAttempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
                user.setFailedLoginAttempts(currentAttempts);
                log.warn("Failed login attempts {}/{} for email: {}", currentAttempts, MAX_FAILED_ATTEMPTS, request.getEmail());

                if (currentAttempts >= MAX_FAILED_ATTEMPTS){
                    user.setLockTime(LocalDateTime.now());
                    log.warn("Account locked for email: {}", request.getEmail());
                }
                userRepository.save(user);
            }
            throw e;

        }

    }

    @Override
    public LoginResponse refreshToken(String refreshToken) throws ParseException, JOSEException {
        log.info("Processing refresh token request");

        // Verify token signature and expiration
        if (!jwtService.verifyToken(refreshToken, false)) {
            log.warn("Refresh token verification failed");
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        JwtInfo tokenInfo = jwtService.parseToken(refreshToken);

        // Find stored refresh token
        ValidRefreshToken storedToken = validRefreshTokenRepository.findByJwtId(tokenInfo.getJwtId())
                .orElseThrow(() -> {
                    log.warn("Refresh token not found in database: {}", tokenInfo.getJwtId());
                    return new IllegalArgumentException("Refresh token not found or has been revoked");
                });

        //check if token still valid
        if (!storedToken.isValid()){
            log.warn("Refresh token is revoked or expired: {}", tokenInfo.getJwtId());
            throw new IllegalArgumentException("Refresh token is revoked or expired");
        }

        User user = storedToken.getUser();
        log.info("Refreshing tokens for user: {}", user.getEmail());

        // Generate new tokens
        TokenPayLoad newAccessPayload = jwtService.generateAccessToken(user);
        TokenPayLoad newRefreshPayLoad = jwtService.generateRefreshToken(user);

        // Revoke old refresh token (token rotation for better security)
        storedToken.setRevoked(true);
        validRefreshTokenRepository.save(storedToken);

        //save new refresh token
        ValidRefreshToken newRefreshToken = ValidRefreshToken.builder()
                .jwtId(newRefreshPayLoad.getJwtId())
                .user(user)
                .expiredTime(LocalDateTime.ofInstant(
                        newRefreshPayLoad.getExpiredTime().toInstant(),
                        ZoneId.systemDefault()
                ))
                .revoked(false)
                .build();
        validRefreshTokenRepository.save(newRefreshToken);

        log.info("Tokens refreshed successfully for user: {}", user.getEmail());

        return LoginResponse.builder()
                .accessToken(newAccessPayload.getToken())
                .refreshToken(newRefreshPayLoad.getToken())
                .build();
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        log.info("Processing password change request for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(()-> {
                    log.error("User not found with ID: {}", userId);
                    return new IllegalArgumentException("User not found with ID: " + userId);
                });

        //verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            log.warn("Incorrect old password for user ID: {}", userId);
            throw  new IllegalArgumentException("Incorrect old password for user ID: " + userId);
        }

        //ensure new password is different
        if (request.getOldPassword().equals(request.getNewPassword())) {
            log.warn("New password same as old password for user: {}", user.getEmail());
            throw new IllegalArgumentException("New password must be different from current password");
        }

        //validate new password format
        if (!PasswordUtils.isValidPassword(request.getNewPassword())){
            log.warn("New password does not meet requirements for user: {}", user.getEmail());
            throw new IllegalArgumentException("Invalid password. " + PasswordUtils.getPasswordValidationMessage());
        }

        //validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())){
            log.warn("Password and confirm password do not match for user: {}", user.getEmail());
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        //update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLastPasswordChangeDate(LocalDateTime.now());
        userRepository.save(user);

        //revoke all refresh tokens for security
        int revokedCount = validRefreshTokenRepository.deleteAllByUser(user);
        log.info("Revoked {} refresh tokens for user: {}", revokedCount, user.getEmail());

        log.info("Password change completed successfully for user: {}", user.getEmail());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Processing forgot password request for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->{
                    log.warn("Forgot password requested for non-existent email: {}", request.getEmail());
                    return new IllegalArgumentException("User not found with email: " + request.getEmail());
                });

        //Generate reset token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(PASSWORD_RESET_TOKEN_VALIDITY_MINUTES);

        //update existing token or create new one
        PasswordResetToken resetToken = passwordResetTokenRepository.findByUser(user)
                .map(existing -> {
                    log.info("Updating existing password reset token for user: {}", user.getEmail());
                    existing.setToken(token);
                    existing.setExpiryDate(expiryDate);
                    existing.setUsed(false);
                    return  existing;
                })
                .orElseGet(() ->{
                    log.info("Creating new password reset token for user: {}", user.getEmail());
                    return PasswordResetToken.builder()
                            .token(token)
                            .user(user)
                            .expiryDate(expiryDate)
                            .used(false)
                            .build();
                });

        passwordResetTokenRepository.save(resetToken);

        //send reset mail
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        log.info("Password reset email sent to: {}", user.getEmail());
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Processing password reset request");

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> {
                    log.warn("Invalid password reset token provided");
                    return new IllegalArgumentException("Invalid password reset token");
                });

        //check if token is valid
        if (!resetToken.isValid()){
            log.warn("Password reset token expired or already used");
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("Password reset token has expired or has been used");
        }

        //validate password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())){
            log.warn("Password and confirm password do not match");
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        //validate password format
        if (!PasswordUtils.isValidPassword(request.getNewPassword())){
            log.warn("New password does not meet requirements");
            throw new IllegalArgumentException("Invalid password. " + PasswordUtils.getPasswordValidationMessage());
        }

        User user = resetToken.getUser();
        log.info("Resetting password for user: {}", user.getEmail());

        //update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLastPasswordChangeDate(LocalDateTime.now());
        userRepository.save(user);

        //mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        //revoke all refresh tokens for security
        int revokedCount = validRefreshTokenRepository.deleteAllByUser(user);
        log.info("Revoked {} refresh tokens for user: {}", revokedCount, user.getEmail());

        log.info("Password reset completed successfully for user: {}", user.getEmail());
    }

    @Override
    public UserResponse register(UserRequest request) {
        // 1. Validate Email & Phone
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }
        if (request.getPhoneNumber() != null && userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already exists: " + request.getPhoneNumber());
        }

        // 2. Validate Password Match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        // 3. Validate Password Complexity (Optional - Reuse PasswordUtils)
        if (!PasswordUtils.isValidPassword(request.getPassword())) {
            throw new IllegalArgumentException("Invalid password. " + PasswordUtils.getPasswordValidationMessage());
        }

        // 4. Handle Role
        // Nếu không truyền roleCode, mặc định là USER (hoặc CITIZEN tùy DB của bạn)
        String roleCode = request.getRollCode();
        if (roleCode == null || roleCode.isEmpty()) {
            roleCode = "USER";
        }

        Role role = roleRepository.findByRoleCode(roleCode).orElse(null);
        if (role == null) {
            role = roleRepository.findByRoleCode("USER")
                    .orElseThrow(() -> new RuntimeException("Default Role USER not found in database."));
        }

        // 5. Create User Entity
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(true) // Mặc định Active khi đăng ký
                .role(role)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // 6. Return Response
        return UserMapper.toUserResponse(user);
    }
}
