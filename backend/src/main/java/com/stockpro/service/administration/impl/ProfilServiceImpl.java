package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Profil;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.service.administration.ProfilService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfilServiceImpl implements ProfilService {

    private final ProfilRepository profilRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Profil> findAll() {
        return profilRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Profil> findAll(Pageable pageable) {
        return profilRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Profil> search(String query, Pageable pageable) {
        return profilRepository.findByLibelleContainingIgnoreCaseOrCodeProfilContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Profil findById(UUID id) {
        return profilRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Profil", id));
    }

    @Override
    public Profil create(Profil profil) {
        profil.setIdPr(null);
        return profilRepository.save(profil);
    }

    @Override
    public Profil update(UUID id, Profil profil) {
        Profil existing = findById(id);
        existing.setCodeProfil(profil.getCodeProfil());
        existing.setLibelle(profil.getLibelle());
        existing.setDescription(profil.getDescription());
        return profilRepository.save(existing);
    }

    @Override
    public void delete(UUID id) {
        Profil existing = findById(id);
        profilRepository.delete(existing);
    }
}
