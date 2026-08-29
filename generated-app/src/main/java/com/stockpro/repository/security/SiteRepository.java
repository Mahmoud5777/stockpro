package com.stockpro.repository.security;

import com.stockpro.entity.security.Site;
import com.stockpro.entity..Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteRepository extends JpaRepository<Site, UUID>, JpaSpecificationExecutor<Site> {
    Optional<Site> findByCode(String code);
}