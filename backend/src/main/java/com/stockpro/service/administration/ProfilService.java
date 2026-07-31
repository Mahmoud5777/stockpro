package com.stockpro.service.administration;

import com.stockpro.entity.administration.Profil;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProfilService {
    List<Profil> findAll();
    Page<Profil> findAll(Pageable pageable);
    Page<Profil> search(String query, Pageable pageable);
    Profil findById(UUID id);
    Profil create(Profil profil);
    Profil update(UUID id, Profil profil);
    void delete(UUID id);
}
