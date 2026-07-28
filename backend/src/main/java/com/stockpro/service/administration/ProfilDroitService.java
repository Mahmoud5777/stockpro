package com.stockpro.service.administration;

import com.stockpro.entity.administration.ProfilDroit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProfilDroitService {
    List<ProfilDroit> findAll();
    Page<ProfilDroit> findAll(Pageable pageable);
    ProfilDroit findById(String id);
    List<ProfilDroit> findByProfil(String idPr);
    List<ProfilDroit> findByFonctionnalite(String idFonc);
    ProfilDroit create(ProfilDroit profilDroit);
    ProfilDroit update(String id, ProfilDroit profilDroit);
    void delete(String id);
}
