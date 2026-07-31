package com.stockpro.service.administration;

import com.stockpro.entity.administration.GroupeRole;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroupeRoleService {
    List<GroupeRole> findAll();
    Page<GroupeRole> findAll(Pageable pageable);
    GroupeRole findById(UUID id);
    List<GroupeRole> findByGroupe(UUID idGr);
    List<GroupeRole> findByRole(UUID idRl);
    GroupeRole create(GroupeRole groupeRole);
    GroupeRole update(UUID id, GroupeRole groupeRole);
    void delete(UUID id);
}
