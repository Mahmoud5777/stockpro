package com.stockpro.service.administration.impl;

import com.stockpro.config.FilterDefinitions;
import com.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.FonctionnaliteMapper;
import com.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.repository.administration.FonctionnaliteRepository;
import com.stockpro.service.administration.FonctionnaliteService;
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
public class FonctionnaliteServiceImpl implements FonctionnaliteService {

    private final FonctionnaliteRepository fonctionnaliteRepository;
    private final ApplicationRepository applicationRepository;
    private final FonctionnaliteMapper fonctionnaliteMapper;

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findAll() {
        return fonctionnaliteRepository.findAll().stream()
                .map(fonctionnaliteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FonctionnaliteDTO> findAll(Pageable pageable) {
        return fonctionnaliteRepository.findAll(pageable).map(fonctionnaliteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<FonctionnaliteDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
        return EntitySpecifications.findAll(fonctionnaliteRepository, FilterDefinitions.FONCTIONNALITE, search, filters, pageable)
                .map(fonctionnaliteMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public FonctionnaliteDTO findById(UUID id) {
        return fonctionnaliteMapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findByApplication(UUID idApp) {
        return fonctionnaliteRepository.findByApplication_IdApp(idApp).stream()
                .map(fonctionnaliteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FonctionnaliteDTO> findRacines() {
        return fonctionnaliteRepository.findByFonctionMereIsNull().stream()
                .map(fonctionnaliteMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public FonctionnaliteDTO create(FonctionnaliteDTO fonctionnaliteDTO) {
        Fonctionnalite fonctionnalite = fonctionnaliteMapper.toEntity(fonctionnaliteDTO);
        fonctionnalite.setIdFonc(null);
        resolveRelations(fonctionnalite);
        return fonctionnaliteMapper.toDto(fonctionnaliteRepository.save(fonctionnalite));
    }

    @Override
    public FonctionnaliteDTO update(UUID id, FonctionnaliteDTO fonctionnaliteDTO) {
        Fonctionnalite existing = findEntityById(id);
        Fonctionnalite incoming = fonctionnaliteMapper.toEntity(fonctionnaliteDTO);
        existing.setCodeFonc(incoming.getCodeFonc());
        existing.setLibelle(incoming.getLibelle());
        existing.setDescription(incoming.getDescription());
        existing.setUrl(incoming.getUrl());
        existing.setIcone(incoming.getIcone());
        existing.setOrderAffichage(incoming.getOrderAffichage());
        existing.setActif(incoming.getActif());
        resolveRelations(incoming);
        existing.setApplication(incoming.getApplication());
        existing.setFonctionMere(incoming.getFonctionMere());
        return fonctionnaliteMapper.toDto(fonctionnaliteRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        Fonctionnalite existing = findEntityById(id);
        fonctionnaliteRepository.delete(existing);
    }

    // Recupere l'entite Fonctionnalite ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private Fonctionnalite findEntityById(UUID id) {
        return fonctionnaliteRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", id));
    }

    private void resolveRelations(Fonctionnalite fonctionnalite) {
        if (fonctionnalite.getApplication() != null && fonctionnalite.getApplication().getIdApp() != null) {
            Application application = applicationRepository.findById(fonctionnalite.getApplication().getIdApp().toString().replace("-", " "))
                    .orElseThrow(() -> new ResourceNotFoundException("Application", fonctionnalite.getApplication().getIdApp()));
            fonctionnalite.setApplication(application);
        } else if (fonctionnalite.getApplication() == null) {
            throw new IllegalArgumentException("L'application (idApp) est obligatoire pour une fonctionnalite");
        }

        if (fonctionnalite.getFonctionMere() != null && fonctionnalite.getFonctionMere().getIdFonc() != null) {
            Fonctionnalite mere = fonctionnaliteRepository.findById(fonctionnalite.getFonctionMere().getIdFonc().toString().replace("-", " "))
                    .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite (mere)", fonctionnalite.getFonctionMere().getIdFonc()));
            fonctionnalite.setFonctionMere(mere);
        } else {
            fonctionnalite.setFonctionMere(null);
        }
    }
}
