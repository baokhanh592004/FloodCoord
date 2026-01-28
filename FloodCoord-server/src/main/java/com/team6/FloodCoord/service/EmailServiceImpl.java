package com.team6.floodcoord.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor

public class EmailServiceImpl implements  EmailService{
    private static final String PASSWORD_RESET_SUBJECT = "Password Reset Request - Flood Coord System";
    private static final int TOKEN_EXPIRY_MINUTES = 5;

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String token) {

        log.info("Sending password reset email to: {}", to);

        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);

            message.setTo(to);
            message.setSubject(PASSWORD_RESET_SUBJECT);
            message.setText(buildPasswordResetEmailBody(resetUrl));

            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", to);

        } catch (MailException e){
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildPasswordResetEmailBody(String resetUrl){
        return "You have requested to reset your password.\n\n"
                + "Please click the link below to reset your password:\n"
                + resetUrl + "\n\n"
                + "If you did not request this, please ignore this email. "
                + "The link will expire in " + TOKEN_EXPIRY_MINUTES + " minutes.\n\n"
                + "Best regards,\n"
                + "Flood Coord Management Team";
    }
}
