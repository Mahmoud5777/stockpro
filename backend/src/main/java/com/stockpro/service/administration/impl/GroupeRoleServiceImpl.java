package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.GroupeRoleDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.GroupeRole;
import com.stockpro.entity.administration.Role;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.GroupeRoleMapper;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupeRoleServiceImpl implements GroupeRoleService {

    private final GroupeRoleRepository groupeRoleRepository;
    private final GroupeRepository groupeRepository;
    private final RoleRepository roleRepository;
    private final GroupeRoleMapper groupeRoleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRoleDTO> findAll() {
        return groupeRoleRepository.findAll().stream()
                .map(groupeRoleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeRoleDTO> findAll(Pageable pageable) {
        return groupeRoleRepository.findAll(pageable).map(groupeRoleMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeRoleDTO findById(UUID id) {
        return groupeRoleMapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRoleDTO> findByGroupe(UUID idGr) {
        return groupeRoleRepository.findByGroupe_IdGr(idGr).stream()
                .map(groupeRoleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GroupeRoleDTO> findByRole(UUID idRl) {
        return groupeRoleRepository.findByRole_IdRl(idRl).stream()
                .map(groupeRoleMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public GroupeRoleDTO create(GroupeRoleDTO groupeRoleDTO) {
        GroupeRole groupeRole = groupeRoleMapper.toEntity(groupeRoleDTO);
        groupeRole.setIdGroupeRole(null);
        resolveRelations(groupeRole);
        return groupeRoleMapper.toDto(groupeRoleRepository.save(groupeRole));
    }

    @Override
    public GroupeRoleDTO update(UUID id, GroupeRoleDTO groupeRoleDTO) {
        GroupeRole existing = findEntityById(id);
        GroupeRole incoming = groupeRoleMapper.toEntity(groupeRoleDTO);
        existing.setActif(incoming.getActif());
        existing.setDateCreation(incoming.getDateCreation());
        resolveRelations(incoming);
        existing.setGroupe(incoming.getGroupe());
        existing.setRole(incoming.getRole());
        return groupeRoleMapper.toDto(groupeRoleRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        GroupeRole existing = findEntityById(id);
        groupeRoleRepository.delete(existing);
    }

    // Recupere l'entite GroupeRole ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private GroupeRole findEntityById(UUID id) {
        return groupeRoleRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("GroupeRole", id));
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
