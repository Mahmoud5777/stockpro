package com.stockpro.service.administration;

import com.stockpro.entity.administration.Groupe;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GroupeService {
    List<Groupe> findAll();
    Page<Groupe> findAll(Pageable pageable);
    Page<Groupe> search(String query, Pageable pageable);
    Groupe findById(String id);
    Groupe create(Groupe groupe);
    Groupe update(String id, Groupe groupe);
    void delete(String id);
}
