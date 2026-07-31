package com.stockpro.service.administration;

import com.stockpro.entity.administration.Groupe;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroupeService {
    List<Groupe> findAll();
    Page<Groupe> findAll(Pageable pageable);
    Page<Groupe> search(String query, Pageable pageable);
    Groupe findById(UUID id);
    Groupe create(Groupe groupe);
    Groupe update(UUID id, Groupe groupe);
    void delete(UUID id);
}
