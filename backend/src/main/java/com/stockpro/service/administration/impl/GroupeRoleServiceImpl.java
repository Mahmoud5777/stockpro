package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.GroupeRole;
import com.stockpro.entity.administration.Role;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.repository.administration.GroupeRoleRepository;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.service.administration.GroupeRoleService;
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
public class GroupeRoleServiceImpl implements GroupeRoleService {

    private final GroupeRoleRepository groupeRoleRepository;
    private final GroupeRepository groupeRepository;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRole> findAll() {
        return groupeRoleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeRole> findAll(Pageable pageable) {
        return groupeRoleRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeRole findById(UUID id) {
        return groupeRoleRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("GroupeRole", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRole> findByGroupe(UUID idGr) {
        return groupeRoleRepository.findByGroupe_IdGr(idGr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRole> findByRole(UUID idRl) {
        return groupeRoleRepository.findByRole_IdRl(idRl);
    }

    @Override
    public GroupeRole create(GroupeRole groupeRole) {
        groupeRole.setIdGroupeRole(null);
        resolveRelations(groupeRole);
        return groupeRoleRepository.save(groupeRole);
    }

    @Override
    public GroupeRole update(UUID id, GroupeRole groupeRole) {
        GroupeRole existing = findById(id);
        existing.setActif(groupeRole.getActif());
        existing.setDateCreation(groupeRole.getDateCreation());
        resolveRelations(groupeRole);
        existing.setGroupe(groupeRole.getGroupe());
        existing.setRole(groupeRole.getRole());
        return groupeRoleRepository.save(existing);
    }

    @Override
    public void delete(UUID id) {
        GroupeRole existing = findById(id);
        groupeRoleRepository.delete(existing);
    }

    private void resolveRelations(GroupeRole groupeRole) {
        if (groupeRole.getGroupe() == null || groupeRole.getGroupe().getIdGr() == null) {
            throw new IllegalArgumentException("Le groupe (idGr) est obligatoire");
        }
        Groupe groupe = groupeRepository.findById(groupeRole.getGroupe().getIdGr().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", groupeRole.getGroupe().getIdGr()));
        groupeRole.setGroupe(groupe);

        if (groupeRole.getRole() == null || groupeRole.getRole().getIdRl() == null) {
            throw new IllegalArgumentException("Le role (idRl) est obligatoire");
        }
        Role role = roleRepository.findById(groupeRole.getRole().getIdRl().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Role", groupeRole.getRole().getIdRl()));
        groupeRole.setRole(role);
    }
}
