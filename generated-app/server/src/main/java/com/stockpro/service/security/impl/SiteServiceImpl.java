package com.stockpro.service.security.impl;

import com.stockpro.dto.security.SiteDTO;
import com.stockpro.entity.security.Site;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.SiteMapper;
import com.stockpro.repository.security.SiteRepository;
import com.stockpro.service.security.SiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
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
        public Page<SiteDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return siteRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<SiteDTO> findAllForExport(String search, Map<String, String> filters) {
                        return siteRepository.findAll().stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public SiteDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public SiteDTO create(SiteDTO dto) {
                        Site entity = mapper.toEntity(dto);
                        entity.setId(null);
                        return mapper.toDto(siteRepository.save(entity));
                        }

                        @Override
                        public SiteDTO update(UUID id, SiteDTO dto) {
                        Site existing = getEntity(id);
                        existing.setDescription(dto.getDescription());
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
                        }