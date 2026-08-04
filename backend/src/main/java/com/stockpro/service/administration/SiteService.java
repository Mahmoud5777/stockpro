package com.stockpro.service.administration;

import com.stockpro.dto.administration.SiteDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SiteService {
    List<SiteDTO> findAll();
    Page<SiteDTO> findAll(Pageable pageable);
    Page<SiteDTO> search(String query, Pageable pageable);
    SiteDTO findById(UUID id);
    List<SiteDTO> findRacines();
    List<SiteDTO> findEnfants(UUID idSiteParent);
    SiteDTO create(SiteDTO dto);
    SiteDTO update(UUID id, SiteDTO dto);
    void delete(UUID id);
}