package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "valid_refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidRefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "jwt_id")
    private String jwtId;

    @Column(nullable = false, name = "expired_time")
    private LocalDateTime expiredTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Boolean revoked = false;

    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Automatically sets the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate(){
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * Checks if the token has expired.
     *
     * @return true if the token has expired, false otherwise
     */
    public boolean isExpired(){
        return LocalDateTime.now().isAfter(expiredTime);
    }

    /**
     * Checks if the token is valid (not expired and not revoked).
     *
     * @return true if the token is valid, false otherwise
     */
    public boolean isValid(){
        return  !isExpired() && !Boolean.TRUE.equals(revoked);
    }
}
