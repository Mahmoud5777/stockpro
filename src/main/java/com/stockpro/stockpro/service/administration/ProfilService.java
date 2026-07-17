package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.Profil;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProfilService {
    List<Profil> findAll();
    Page<Profil> findAll(Pageable pageable);
    Page<Profil> search(String query, Pageable pageable);
    Profil findById(String id);
    Profil create(Profil profil);
    Profil update(String id, Profil profil);
    void delete(String id);
}
