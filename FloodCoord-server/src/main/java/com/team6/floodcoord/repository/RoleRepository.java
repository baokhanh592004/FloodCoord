package com.team6.floodcoord.repository;

import com.team6.floodcoord.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    @Query("SELECT r FROM Role r WHERE r.roleCode = :roleCode")
    Role findRoleByRoleCode(@Param("roleCode") String roleCode);

    Optional<Role> findByRoleName(String roleName);

    Optional<Role> findByRoleCode(String roleCode);

}
