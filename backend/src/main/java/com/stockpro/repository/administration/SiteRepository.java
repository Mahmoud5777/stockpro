package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends JpaRepository<Site, String> {
    Optional<Site> findByCodeSite(String codeSite);
    List<Site> findBySiteParent_IdSite(String idSiteParent);
    List<Site> findBySiteParentIsNull();
    org.springframework.data.domain.Page<Site> findByNomSiteContainingIgnoreCaseOrCodeSiteContainingIgnoreCase(String nomSite, String codeSite, org.springframework.data.domain.Pageable pageable);
}
