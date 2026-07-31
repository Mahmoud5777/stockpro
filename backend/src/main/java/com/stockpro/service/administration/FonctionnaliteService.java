package com.stockpro.service.administration;

import com.stockpro.entity.administration.Fonctionnalite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface FonctionnaliteService {
    List<Fonctionnalite> findAll();
    Page<Fonctionnalite> findAll(Pageable pageable);
    Page<Fonctionnalite> search(String query, Pageable pageable);
    Fonctionnalite findById(UUID id);
    List<Fonctionnalite> findByApplication(UUID idApp);
    List<Fonctionnalite> findRacines();
    Fonctionnalite create(Fonctionnalite fonctionnalite);
    Fonctionnalite update(UUID id, Fonctionnalite fonctionnalite);
    void delete(UUID id);
}
