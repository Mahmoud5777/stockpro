package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.FonctionnaliteMapper;
import com.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.repository.administration.FonctionnaliteRepository;
import com.stockpro.service.administration.FonctionnaliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FonctionnaliteServiceImpl implements FonctionnaliteService {

    private final FonctionnaliteRepository fonctionnaliteRepository;
    private final ApplicationRepository applicationRepository;
    private final FonctionnaliteMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findAll() {
        return fonctionnaliteRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FonctionnaliteDTO> findAll(Pageable pageable) {
        return fonctionnaliteRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FonctionnaliteDTO> search(String query, Pageable pageable) {
        return fonctionnaliteRepository
                .findByLibelleContainingIgnoreCaseOrCodeFoncContainingIgnoreCase(query, query, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public FonctionnaliteDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findRacines() {
        return fonctionnaliteRepository.findByFonctionMereIsNull().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findEnfants(UUID idFoncMere) {
        return fonctionnaliteRepository.findByFonctionMere_IdFonc(idFoncMere).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findByApplication(UUID idApp) {
        return fonctionnaliteRepository.findByApplication_IdApp(idApp).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FonctionnaliteDTO create(FonctionnaliteDTO dto) {
        Fonctionnalite fonctionnalite = mapper.toEntity(dto);
        fonctionnalite.setIdFonc(null);
        fonctionnalite.setApplication(resolveApplication(dto.getIdApp()));
        fonctionnalite.setFonctionMere(resolveFonctionMere(dto.getIdFoncMere()));
        return mapper.toDto(fonctionnaliteRepository.save(fonctionnalite));
    }

    @Override
    public FonctionnaliteDTO update(UUID id, FonctionnaliteDTO dto) {
        Fonctionnalite existing = getEntity(id);
        existing.setCodeFonc(dto.getCodeFonc());
        existing.setLibelle(dto.getLibelle());
        existing.setDescription(dto.getDescription());
        existing.setUrl(dto.getUrl());
        existing.setIcone(dto.getIcone());
        existing.setOrderAffichage(dto.getOrderAffichage());
        existing.setActif(dto.getActif());
        existing.setApplication(resolveApplication(dto.getIdApp()));
        existing.setFonctionMere(resolveFonctionMere(dto.getIdFoncMere()));
        return mapper.toDto(fonctionnaliteRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        fonctionnaliteRepository.delete(getEntity(id));
    }

    private Fonctionnalite getEntity(UUID id) {
        return fonctionnaliteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", id));
    }

    private Application resolveApplication(UUID idApp) {
        if (idApp == null) {
            throw new IllegalArgumentException("L'application (idApp) est obligatoire");
        }
        return applicationRepository.findById(idApp)
                .orElseThrow(() -> new ResourceNotFoundException("Application", idApp));
    }

    private Fonctionnalite resolveFonctionMere(UUID idFoncMere) {
        if (idFoncMere == null) {
            return null;
        }
        return fonctionnaliteRepository.findById(idFoncMere)
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite (mere)", idFoncMere));
    }
}
