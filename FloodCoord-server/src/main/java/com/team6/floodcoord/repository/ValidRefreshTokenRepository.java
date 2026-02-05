package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.User;
import com.team6.floodcoord.model.ValidRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ValidRefreshTokenRepository extends JpaRepository<ValidRefreshToken, Long> {
    Optional<ValidRefreshToken> findByJwtId(String jwtId);
    List<ValidRefreshToken> findAllByUser(User user);

    @Query("SELECT v FROM ValidRefreshToken v WHERE v.user = :user AND v.revoked = false AND v.expiredTime > :now")
    List<ValidRefreshToken> findValidTokensByUser(@Param("user") User user, @Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM ValidRefreshToken v WHERE v.user = :user")
    int deleteAllByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE ValidRefreshToken v SET v.revoked = true WHERE v.user = :user AND v.revoked = false")
    int revokeAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM ValidRefreshToken v WHERE v.expiredTime < :now")
    int deleteExpiredTokens(@Param("now") LocalDateTime now);
}
