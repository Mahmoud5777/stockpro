package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.SiteDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.SiteMapper;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.service.administration.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SiteServiceImpl implements SiteService {

    private final SiteRepository siteRepository;
    private final SiteMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<SiteDTO> findAll() {
        return siteRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiteDTO> findAll(Pageable pageable) {
        return siteRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SiteDTO> search(String query, Pageable pageable) {
        return siteRepository
                .findByNomSiteContainingIgnoreCaseOrCodeSiteContainingIgnoreCase(query, query, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public SiteDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteDTO> findRacines() {
        return siteRepository.findBySiteParentIsNull().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SiteDTO> findEnfants(UUID idSiteParent) {
        return siteRepository.findBySiteParent_IdSite(idSiteParent).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public SiteDTO create(SiteDTO dto) {
        Site site = mapper.toEntity(dto);
        site.setIdSite(null);
        site.setSiteParent(resolveParent(dto.getIdSiteParent()));
        return mapper.toDto(siteRepository.save(site));
    }

    @Override
    public SiteDTO update(UUID id, SiteDTO dto) {
        Site existing = getEntity(id);
        existing.setCodeSite(dto.getCodeSite());
        existing.setNomSite(dto.getNomSite());
        existing.setDescription(dto.getDescription());
        existing.setAddress(dto.getAddress());
        existing.setSiteParent(resolveParent(dto.getIdSiteParent()));
        return mapper.toDto(siteRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        siteRepository.delete(getEntity(id));
    }

    private Site getEntity(UUID id) {
        return siteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Site", id));
    }

    private Site resolveParent(UUID idSiteParent) {
        if (idSiteParent == null) {
            return null;
        }
        return siteRepository.findById(idSiteParent)
                .orElseThrow(() -> new ResourceNotFoundException("Site (parent)", idSiteParent));
    }
}