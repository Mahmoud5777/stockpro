package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.GroupeProfilDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.GroupeProfil;
import com.stockpro.entity.administration.Profil;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.GroupeProfilMapper;
import com.stockpro.repository.administration.GroupeProfilRepository;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.service.administration.GroupeProfilService;
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
public class GroupeProfilServiceImpl implements GroupeProfilService {

    private final GroupeProfilRepository groupeProfilRepository;
    private final GroupeRepository groupeRepository;
    private final ProfilRepository profilRepository;
    private final GroupeProfilMapper groupeProfilMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfilDTO> findAll() {
        return groupeProfilRepository.findAll().stream()
                .map(groupeProfilMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeProfilDTO> findAll(Pageable pageable) {
        return groupeProfilRepository.findAll(pageable).map(groupeProfilMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeProfilDTO findById(UUID id) {
        return groupeProfilMapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfilDTO> findByGroupe(UUID idGr) {
        return groupeProfilRepository.findByGroupe_IdGr(idGr).stream()
                .map(groupeProfilMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfilDTO> findByProfil(UUID idPr) {
        return groupeProfilRepository.findByProfil_IdPr(idPr).stream()
                .map(groupeProfilMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GroupeProfilDTO create(GroupeProfilDTO groupeProfilDTO) {
        GroupeProfil groupeProfil = groupeProfilMapper.toEntity(groupeProfilDTO);
        groupeProfil.setIdGroupeProfil(null);
        resolveRelations(groupeProfil);
        return groupeProfilMapper.toDto(groupeProfilRepository.save(groupeProfil));
    }

    @Override
    public GroupeProfilDTO update(UUID id, GroupeProfilDTO groupeProfilDTO) {
        GroupeProfil existing = findEntityById(id);
        GroupeProfil incoming = groupeProfilMapper.toEntity(groupeProfilDTO);
        existing.setActif(incoming.getActif());
        existing.setDateCreation(incoming.getDateCreation());
        resolveRelations(incoming);
        existing.setGroupe(incoming.getGroupe());
        existing.setProfil(incoming.getProfil());
        return groupeProfilMapper.toDto(groupeProfilRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        GroupeProfil existing = findEntityById(id);
        groupeProfilRepository.delete(existing);
    }

    // Recupere l'entite GroupeProfil ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private GroupeProfil findEntityById(UUID id) {
        return groupeProfilRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("GroupeProfil", id));
    }

    private void resolveRelations(GroupeProfil groupeProfil) {
        if (groupeProfil.getGroupe() == null || groupeProfil.getGroupe().getIdGr() == null) {
            throw new IllegalArgumentException("Le groupe (idGr) est obligatoire");
        }
        Groupe groupe = groupeRepository.findById(groupeProfil.getGroupe().getIdGr().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", groupeProfil.getGroupe().getIdGr()));
        groupeProfil.setGroupe(groupe);

        if (groupeProfil.getProfil() == null || groupeProfil.getProfil().getIdPr() == null) {
            throw new IllegalArgumentException("Le profil (idPr) est obligatoire");
        }
        Profil profil = profilRepository.findById(groupeProfil.getProfil().getIdPr().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Profil", groupeProfil.getProfil().getIdPr()));
        groupeProfil.setProfil(profil);
    }
}
