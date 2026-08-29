package com.stockpro.repository.security;

import com.stockpro.entity.security.UserSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserSiteRepository extends JpaRepository<UserSite, UUID>, JpaSpecificationExecutor<UserSite> {
}