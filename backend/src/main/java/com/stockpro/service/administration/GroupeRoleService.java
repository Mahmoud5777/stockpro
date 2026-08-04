package com.stockpro.service.administration;

import com.stockpro.dto.administration.GroupeRoleDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroupeRoleService {
    List<GroupeRoleDTO> findAll();
    Page<GroupeRoleDTO> findAll(Pageable pageable);
    GroupeRoleDTO findById(UUID id);
    List<GroupeRoleDTO> findByGroupe(UUID idGr);
    List<GroupeRoleDTO> findByRole(UUID idRl);
    GroupeRoleDTO create(GroupeRoleDTO groupeRoleDTO);
    GroupeRoleDTO update(UUID id, GroupeRoleDTO groupeRoleDTO);
    void delete(UUID id);
}
