package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.Site;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SiteService {
    List<Site> findAll();
    Page<Site> findAll(Pageable pageable);
    Page<Site> search(String query, Pageable pageable);
    Site findById(String id);
    List<Site> findRacines();
    List<Site> findEnfants(String idSiteParent);
    Site create(Site site);
    Site update(String id, Site site);
    void delete(String id);
}
