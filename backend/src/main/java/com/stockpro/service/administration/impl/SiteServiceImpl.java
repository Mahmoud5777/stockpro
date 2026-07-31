package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Site;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.service.administration.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Site> findAll() {
        return siteRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Site> findAll(Pageable pageable) {
        return siteRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Site> search(String query, Pageable pageable) {
        return siteRepository.findByNomSiteContainingIgnoreCaseOrCodeSiteContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Site findById(UUID id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Site> findRacines() {
        return siteRepository.findBySiteParentIsNull();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Site> findEnfants(UUID idSiteParent) {
        return siteRepository.findBySiteParent_IdSite(idSiteParent);
    }

    @Override
    public Site create(Site site) {
        site.setIdSite(null);
        resolveParent(site);
        return siteRepository.save(site);
    }

    @Override
    public Site update(UUID id, Site site) {
        Site existing = findById(id);
        existing.setCodeSite(site.getCodeSite());
        existing.setNomSite(site.getNomSite());
        existing.setDescription(site.getDescription());
        existing.setAddress(site.getAddress());
        resolveParent(site);
        existing.setSiteParent(site.getSiteParent());
        return siteRepository.save(existing);
    }

    @Override
    public void delete(UUID id) {
        Site existing = findById(id);
        siteRepository.delete(existing);
    }

    private void resolveParent(Site site) {
        if (site.getSiteParent() != null && site.getSiteParent().getIdSite() != null) {
            Site parent = siteRepository.findById(site.getSiteParent().getIdSite())
                    .orElseThrow(() -> new ResourceNotFoundException("Site (parent)", site.getSiteParent().getIdSite()));
            site.setSiteParent(parent);
        } else {
            site.setSiteParent(null);
        }
    }
}
