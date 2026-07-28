package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.entity.administration.Profil;
import com.stockpro.entity.administration.ProfilDroit;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.FonctionnaliteRepository;
import com.stockpro.repository.administration.ProfilDroitRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.service.administration.ProfilDroitService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfilDroitServiceImpl implements ProfilDroitService {

    private final ProfilDroitRepository profilDroitRepository;
    private final ProfilRepository profilRepository;
    private final FonctionnaliteRepository fonctionnaliteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroit> findAll() {
        return profilDroitRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfilDroit> findAll(Pageable pageable) {
        return profilDroitRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfilDroit findById(String id) {
        return profilDroitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProfilDroit", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroit> findByProfil(String idPr) {
        return profilDroitRepository.findByProfil_IdPr(idPr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroit> findByFonctionnalite(String idFonc) {
        return profilDroitRepository.findByFonctionnalite_IdFonc(idFonc);
    }

    @Override
    public ProfilDroit create(ProfilDroit profilDroit) {
        profilDroit.setIdProfilDroit(null);
        resolveRelations(profilDroit);
        return profilDroitRepository.save(profilDroit);
    }

    @Override
    public ProfilDroit update(String id, ProfilDroit profilDroit) {
        ProfilDroit existing = findById(id);
        existing.setConsultation(profilDroit.getConsultation());
        existing.setAjout(profilDroit.getAjout());
        existing.setSuppression(profilDroit.getSuppression());
        existing.setImpression(profilDroit.getImpression());
        existing.setExport(profilDroit.getExport());
        existing.setModification(profilDroit.getModification());
        resolveRelations(profilDroit);
        existing.setProfil(profilDroit.getProfil());
        existing.setFonctionnalite(profilDroit.getFonctionnalite());
        return profilDroitRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        ProfilDroit existing = findById(id);
        profilDroitRepository.delete(existing);
    }

    private void resolveRelations(ProfilDroit profilDroit) {
        if (profilDroit.getProfil() == null || profilDroit.getProfil().getIdPr() == null) {
            throw new IllegalArgumentException("Le profil (idPr) est obligatoire");
        }
        Profil profil = profilRepository.findById(profilDroit.getProfil().getIdPr())
                .orElseThrow(() -> new ResourceNotFoundException("Profil", profilDroit.getProfil().getIdPr()));
        profilDroit.setProfil(profil);

        if (profilDroit.getFonctionnalite() == null || profilDroit.getFonctionnalite().getIdFonc() == null) {
            throw new IllegalArgumentException("La fonctionnalite (idFonc) est obligatoire");
        }
        Fonctionnalite fonctionnalite = fonctionnaliteRepository.findById(profilDroit.getFonctionnalite().getIdFonc())
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", profilDroit.getFonctionnalite().getIdFonc()));
        profilDroit.setFonctionnalite(fonctionnalite);
    }
}
