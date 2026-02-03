package com.team6.floodcoord.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity =  User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false, name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(nullable = false, name = "created_date")
    private LocalDateTime createdAt;

    @Column(name = "used")
    @Builder.Default
    private Boolean used = false;

    /**
     * Automatically sets the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate(){
        if (createdAt == null){
            createdAt = LocalDateTime.now();
        }
    }

    /**
     * Checks if the token has expired.
     *
     * @return true if the token has expired, false otherwise
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    /**
     * Checks if the token is valid (not expired and not used).
     *
     * @return true if the token is valid, false otherwise
     */
    public boolean isValid() {
        return !isExpired() && !Boolean.TRUE.equals(used);
    }
}
