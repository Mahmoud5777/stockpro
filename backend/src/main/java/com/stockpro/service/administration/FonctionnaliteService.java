package com.stockpro.service.administration;

import com.stockpro.entity.administration.Fonctionnalite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FonctionnaliteService {
    List<Fonctionnalite> findAll();
    Page<Fonctionnalite> findAll(Pageable pageable);
    Page<Fonctionnalite> search(String query, Pageable pageable);
    Fonctionnalite findById(String id);
    List<Fonctionnalite> findByApplication(String idApp);
    List<Fonctionnalite> findRacines();
    Fonctionnalite create(Fonctionnalite fonctionnalite);
    Fonctionnalite update(String id, Fonctionnalite fonctionnalite);
    void delete(String id);
}
