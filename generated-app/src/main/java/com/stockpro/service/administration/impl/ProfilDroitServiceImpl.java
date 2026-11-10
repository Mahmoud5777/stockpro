package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.ProfilDroitDTO;
import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.entity.administration.Profil;
import com.stockpro.entity.administration.ProfilDroit;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ProfilDroitMapper;
import com.stockpro.repository.administration.FonctionnaliteRepository;
import com.stockpro.repository.administration.ProfilDroitRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.service.administration.ProfilDroitService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfilDroitServiceImpl implements ProfilDroitService {

    private final ProfilDroitRepository profilDroitRepository;
    private final ProfilRepository profilRepository;
    private final FonctionnaliteRepository fonctionnaliteRepository;
    private final ProfilDroitMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroitDTO> findAll() {
        return profilDroitRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfilDroitDTO> findAll(Pageable pageable) {
        return profilDroitRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfilDroitDTO findById(UUID id) {
        return mapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroitDTO> findByProfil(UUID idPr) {
        return profilDroitRepository.findByProfil_IdPr(idPr).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProfilDroitDTO create(ProfilDroitDTO dto) {
        ProfilDroit droits = mapper.toEntity(dto);
        droits.setIdProfilDroit(null);
        resolveRelations(droits);
        return mapper.toDto(profilDroitRepository.save(droits));
    }

    @Override
    public ProfilDroitDTO update(UUID id, ProfilDroitDTO dto) {
        ProfilDroit existing = findEntityById(id);
        ProfilDroit incoming = mapper.toEntity(dto);
        existing.setConsultation(incoming.getConsultation());
        existing.setAjout(incoming.getAjout());
        existing.setModification(incoming.getModification());
        existing.setSuppression(incoming.getSuppression());
        existing.setExport(incoming.getExport());
        existing.setImpression(incoming.getImpression());
        resolveRelations(incoming);
        existing.setProfil(incoming.getProfil());
        existing.setFonctionnalite(incoming.getFonctionnalite());
        return mapper.toDto(profilDroitRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        profilDroitRepository.delete(findEntityById(id));
    }

    private ProfilDroit findEntityById(UUID id) {
        return profilDroitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProfilDroit", id));
    }

    private void resolveRelations(ProfilDroit droits) {
        if (droits.getProfil() == null || droits.getProfil().getIdPr() == null) {
            throw new IllegalArgumentException("Le profil (idPr) est obligatoire");
        }
        Profil profil = profilRepository.findById(droits.getProfil().getIdPr())
                .orElseThrow(() -> new ResourceNotFoundException("Profil", droits.getProfil().getIdPr()));
        droits.setProfil(profil);

        if (droits.getFonctionnalite() == null || droits.getFonctionnalite().getIdFonc() == null) {
            throw new IllegalArgumentException("La fonctionnalite (idFonc) est obligatoire");
        }
        Fonctionnalite fonctionnalite = fonctionnaliteRepository.findById(droits.getFonctionnalite().getIdFonc())
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", droits.getFonctionnalite().getIdFonc()));
        droits.setFonctionnalite(fonctionnalite);
    }
}
