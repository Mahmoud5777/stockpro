package com.stockpro.stockpro.service.administration.impl;

import com.stockpro.stockpro.entity.administration.Application;
import com.stockpro.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.stockpro.exception.ResourceNotFoundException;
import com.stockpro.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.stockpro.repository.administration.FonctionnaliteRepository;
import com.stockpro.stockpro.service.administration.FonctionnaliteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FonctionnaliteServiceImpl implements FonctionnaliteService {

    private final FonctionnaliteRepository fonctionnaliteRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Fonctionnalite> findAll() {
        return fonctionnaliteRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Fonctionnalite> findAll(Pageable pageable) {
        return fonctionnaliteRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Fonctionnalite> search(String query, Pageable pageable) {
        return fonctionnaliteRepository.findByLibelleContainingIgnoreCaseOrCodeFoncContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Fonctionnalite findById(String id) {
        return fonctionnaliteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Fonctionnalite> findByApplication(String idApp) {
        return fonctionnaliteRepository.findByApplication_IdApp(idApp);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Fonctionnalite> findRacines() {
        return fonctionnaliteRepository.findByFonctionMereIsNull();
    }

    @Override
    public Fonctionnalite create(Fonctionnalite fonctionnalite) {
        fonctionnalite.setIdFonc(null);
        resolveRelations(fonctionnalite);
        return fonctionnaliteRepository.save(fonctionnalite);
    }

    @Override
    public Fonctionnalite update(String id, Fonctionnalite fonctionnalite) {
        Fonctionnalite existing = findById(id);
        existing.setCodeFonc(fonctionnalite.getCodeFonc());
        existing.setLibelle(fonctionnalite.getLibelle());
        existing.setDescription(fonctionnalite.getDescription());
        existing.setUrl(fonctionnalite.getUrl());
        existing.setIcone(fonctionnalite.getIcone());
        existing.setOrderAffichage(fonctionnalite.getOrderAffichage());
        existing.setActif(fonctionnalite.getActif());
        resolveRelations(fonctionnalite);
        existing.setApplication(fonctionnalite.getApplication());
        existing.setFonctionMere(fonctionnalite.getFonctionMere());
        return fonctionnaliteRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        Fonctionnalite existing = findById(id);
        fonctionnaliteRepository.delete(existing);
    }

    private void resolveRelations(Fonctionnalite fonctionnalite) {
        if (fonctionnalite.getApplication() != null && fonctionnalite.getApplication().getIdApp() != null) {
            Application application = applicationRepository.findById(fonctionnalite.getApplication().getIdApp())
                    .orElseThrow(() -> new ResourceNotFoundException("Application", fonctionnalite.getApplication().getIdApp()));
            fonctionnalite.setApplication(application);
        } else if (fonctionnalite.getApplication() == null) {
            throw new IllegalArgumentException("L'application (idApp) est obligatoire pour une fonctionnalite");
        }

        if (fonctionnalite.getFonctionMere() != null && fonctionnalite.getFonctionMere().getIdFonc() != null) {
            Fonctionnalite mere = fonctionnaliteRepository.findById(fonctionnalite.getFonctionMere().getIdFonc())
                    .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite (mere)", fonctionnalite.getFonctionMere().getIdFonc()));
            fonctionnalite.setFonctionMere(mere);
        } else {
            fonctionnalite.setFonctionMere(null);
        }
    }
}
