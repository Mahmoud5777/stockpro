package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteRepository extends JpaRepository<Site, UUID>, JpaSpecificationExecutor<Site> {
    Optional<Site> findByCodeSite(String codeSite);
    List<Site> findBySiteParent_IdSite(UUID idSiteParent);
    List<Site> findBySiteParentIsNull();
}
