package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SiteRepository extends JpaRepository<Site, UUID> {
    Optional<Site> findByCodeSite(String codeSite);
    List<Site> findBySiteParent_IdSite(UUID idSiteParent);
    List<Site> findBySiteParentIsNull();
    //List<Site> findByid(UUID idSite);

    org.springframework.data.domain.Page<Site> findByNomSiteContainingIgnoreCaseOrCodeSiteContainingIgnoreCase(String nomSite, String codeSite, org.springframework.data.domain.Pageable pageable);
}
