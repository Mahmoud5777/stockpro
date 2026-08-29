package com.stockpro.repository.security;

import com.stockpro.entity.security.GroupeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GroupeRoleRepository extends JpaRepository<GroupeRole, UUID>, JpaSpecificationExecutor<GroupeRole> {
}