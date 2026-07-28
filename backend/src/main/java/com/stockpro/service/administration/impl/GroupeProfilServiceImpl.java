package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.GroupeProfil;
import com.stockpro.entity.administration.Profil;
import com.stockpro.exception.ResourceNotFoundException;
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

@Service
@RequiredArgsConstructor
@Transactional
public class GroupeProfilServiceImpl implements GroupeProfilService {

    private final GroupeProfilRepository groupeProfilRepository;
    private final GroupeRepository groupeRepository;
    private final ProfilRepository profilRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfil> findAll() {
        return groupeProfilRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeProfil> findAll(Pageable pageable) {
        return groupeProfilRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeProfil findById(String id) {
        return groupeProfilRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GroupeProfil", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfil> findByGroupe(String idGr) {
        return groupeProfilRepository.findByGroupe_IdGr(idGr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeProfil> findByProfil(String idPr) {
        return groupeProfilRepository.findByProfil_IdPr(idPr);
    }

    @Override
    public GroupeProfil create(GroupeProfil groupeProfil) {
        groupeProfil.setIdGroupeProfil(null);
        resolveRelations(groupeProfil);
        return groupeProfilRepository.save(groupeProfil);
    }

    @Override
    public GroupeProfil update(String id, GroupeProfil groupeProfil) {
        GroupeProfil existing = findById(id);
        existing.setActif(groupeProfil.getActif());
        existing.setDateCreation(groupeProfil.getDateCreation());
        resolveRelations(groupeProfil);
        existing.setGroupe(groupeProfil.getGroupe());
        existing.setProfil(groupeProfil.getProfil());
        return groupeProfilRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        GroupeProfil existing = findById(id);
        groupeProfilRepository.delete(existing);
    }

    private void resolveRelations(GroupeProfil groupeProfil) {
        if (groupeProfil.getGroupe() == null || groupeProfil.getGroupe().getIdGr() == null) {
            throw new IllegalArgumentException("Le groupe (idGr) est obligatoire");
        }
        Groupe groupe = groupeRepository.findById(groupeProfil.getGroupe().getIdGr())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", groupeProfil.getGroupe().getIdGr()));
        groupeProfil.setGroupe(groupe);

        if (groupeProfil.getProfil() == null || groupeProfil.getProfil().getIdPr() == null) {
            throw new IllegalArgumentException("Le profil (idPr) est obligatoire");
        }
        Profil profil = profilRepository.findById(groupeProfil.getProfil().getIdPr())
                .orElseThrow(() -> new ResourceNotFoundException("Profil", groupeProfil.getProfil().getIdPr()));
        groupeProfil.setProfil(profil);
    }
}
