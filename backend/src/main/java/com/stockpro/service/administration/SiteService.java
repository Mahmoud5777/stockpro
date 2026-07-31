package com.stockpro.service.administration;

import com.stockpro.entity.administration.Site;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SiteService {
    List<Site> findAll();
    Page<Site> findAll(Pageable pageable);
    Page<Site> search(String query, Pageable pageable);
    Site findById(UUID id);
    List<Site> findRacines();
    List<Site> findEnfants(UUID idSiteParent);
    Site create(Site site);
    Site update(UUID id, Site site);
    void delete(UUID id);
}
