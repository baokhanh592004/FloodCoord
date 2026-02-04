package com.team6.floodcoord.model;

import com.team6.floodcoord.model.enums.TeamStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rescue_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RescueTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // Ví dụ: Đội cứu hộ số 1

    private String description; // Khu vực hoạt động hoặc chuyên môn

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Một đội có thể có 1 đội trưởng (Leader) - là một User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User leader;

    // Một đội có nhiều thành viên
    @OneToMany(mappedBy = "rescueTeam", fetch = FetchType.LAZY)
    private List<User> members;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TeamStatus status = TeamStatus.AVAILABLE;
}
