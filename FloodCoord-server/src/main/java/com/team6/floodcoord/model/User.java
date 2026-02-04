package com.team6.floodcoord.model;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    @Column(nullable = false)
    private Boolean status;

    @Column(nullable = false)
    private String password;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @Column(name = "last_password_change_date")
    private LocalDateTime lastPasswordChangeDate;

    @Column(name = "last_login_date")
    private LocalDateTime lastLoginDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private RescueTeam rescueTeam;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (role == null){
            return List.of();
        }
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.getRoleCode())
        );
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        //if not have lock time -> account not lock
        if (lockTime == null){
            return  true;
        }
        //lock policy: lock in 30mins
        long lockDurationMinutes = 30;

        //if the current time has exceeded the lock time + 30 mins -> considered unlocked
        if (LocalDateTime.now().isAfter(lockTime.plusMinutes(lockDurationMinutes))){
            return true;
        }
        return false;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        //logic expired password
        if (lastPasswordChangeDate == null) return false;

        //if the pass change date + 90days is still after the current date -> no expired (true)
        //otherwise -> expired (false)
        return lastPasswordChangeDate.plusDays(90).isAfter(LocalDateTime.now());
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(this.status);
    }

    @PrePersist
    protected void onCreate() {
        if (lastPasswordChangeDate == null) lastPasswordChangeDate = LocalDateTime.now();
        if (lastLoginDate == null) lastLoginDate = LocalDateTime.now();
        if (failedLoginAttempts == null) failedLoginAttempts = 0;
    }
}
