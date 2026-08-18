package com.stockpro.service.administration.impl;

import com.stockpro.config.FilterDefinitions;
import com.stockpro.dto.administration.ProfilDTO;
import com.stockpro.entity.administration.Profil;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ProfilMapper;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.service.administration.ProfilService;
import com.stockpro.util.EntitySpecifications;
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
public class ProfilServiceImpl implements ProfilService {

    private final ProfilRepository profilRepository;
    private final ProfilMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDTO> findAll() {
        return profilRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfilDTO> findAll(Pageable pageable) {
        return profilRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfilDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
        return EntitySpecifications.findAll(profilRepository, FilterDefinitions.PROFIL, search, filters, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDTO> findAllForExport(String search, Map<String, String> filters) {
        return EntitySpecifications.findAllList(profilRepository, FilterDefinitions.PROFIL, search, filters)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProfilDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    public ProfilDTO create(ProfilDTO dto) {
        Profil profil = mapper.toEntity(dto);
        profil.setIdPr(null);
        return mapper.toDto(profilRepository.save(profil));
    }

    @Override
    public ProfilDTO update(UUID id, ProfilDTO dto) {
        Profil existing = getEntity(id);
        existing.setCodeProfil(dto.getCodeProfil());
        existing.setLibelle(dto.getLibelle());
        existing.setDescription(dto.getDescription());
        return mapper.toDto(profilRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        profilRepository.delete(getEntity(id));
    }

    private Profil getEntity(UUID id) {
        return profilRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Profil", id));
    }
}