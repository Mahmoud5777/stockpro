package com.stockpro.service.administration;

import com.stockpro.entity.administration.ProfilDroit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProfilDroitService {
    List<ProfilDroit> findAll();
    Page<ProfilDroit> findAll(Pageable pageable);
    ProfilDroit findById(UUID id);
    List<ProfilDroit> findByProfil(UUID idPr);
    List<ProfilDroit> findByFonctionnalite(UUID idFonc);
    ProfilDroit create(ProfilDroit profilDroit);
    ProfilDroit update(UUID id, ProfilDroit profilDroit);
    void delete(UUID id);
}
