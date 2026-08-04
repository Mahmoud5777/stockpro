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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
    private final ProfilDroitMapper profilDroitMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroitDTO> findAll() {
        return profilDroitRepository.findAll().stream()
                .map(profilDroitMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProfilDroitDTO> findAll(Pageable pageable) {
        return profilDroitRepository.findAll(pageable).map(profilDroitMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProfilDroitDTO findById(UUID id) {
        return profilDroitMapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroitDTO> findByProfil(UUID idPr) {
        return profilDroitRepository.findByProfil_IdPr(idPr).stream()
                .map(profilDroitMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfilDroitDTO> findByFonctionnalite(UUID idFonc) {
        return profilDroitRepository.findByFonctionnalite_IdFonc(idFonc).stream()
                .map(profilDroitMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProfilDroitDTO create(ProfilDroitDTO profilDroitDTO) {
        ProfilDroit profilDroit = profilDroitMapper.toEntity(profilDroitDTO);
        profilDroit.setIdProfilDroit(null);
        resolveRelations(profilDroit);
        return profilDroitMapper.toDto(profilDroitRepository.save(profilDroit));
    }

    @Override
    public ProfilDroitDTO update(UUID id, ProfilDroitDTO profilDroitDTO) {
        ProfilDroit existing = findEntityById(id);
        ProfilDroit incoming = profilDroitMapper.toEntity(profilDroitDTO);
        existing.setConsultation(incoming.getConsultation());
        existing.setAjout(incoming.getAjout());
        existing.setSuppression(incoming.getSuppression());
        existing.setImpression(incoming.getImpression());
        existing.setExport(incoming.getExport());
        existing.setModification(incoming.getModification());
        resolveRelations(incoming);
        existing.setProfil(incoming.getProfil());
        existing.setFonctionnalite(incoming.getFonctionnalite());
        return profilDroitMapper.toDto(profilDroitRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        ProfilDroit existing = findEntityById(id);
        profilDroitRepository.delete(existing);
    }

    // Recupere l'entite ProfilDroit ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private ProfilDroit findEntityById(UUID id) {
        return profilDroitRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("ProfilDroit", id));
    }

    private void resolveRelations(ProfilDroit profilDroit) {
        if (profilDroit.getProfil() == null || profilDroit.getProfil().getIdPr() == null) {
            throw new IllegalArgumentException("Le profil (idPr) est obligatoire");
        }
        Profil profil = profilRepository.findById(profilDroit.getProfil().getIdPr().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Profil", profilDroit.getProfil().getIdPr()));
        profilDroit.setProfil(profil);

        if (profilDroit.getFonctionnalite() == null || profilDroit.getFonctionnalite().getIdFonc() == null) {
            throw new IllegalArgumentException("La fonctionnalite (idFonc) est obligatoire");
        }
        Fonctionnalite fonctionnalite = fonctionnaliteRepository.findById(profilDroit.getFonctionnalite().getIdFonc().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Fonctionnalite", profilDroit.getFonctionnalite().getIdFonc()));
        profilDroit.setFonctionnalite(fonctionnalite);
    }
}
