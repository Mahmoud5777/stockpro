package com.stockpro.service.administration;

import com.stockpro.entity.administration.GroupeRole;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GroupeRoleService {
    List<GroupeRole> findAll();
    Page<GroupeRole> findAll(Pageable pageable);
    GroupeRole findById(String id);
    List<GroupeRole> findByGroupe(String idGr);
    List<GroupeRole> findByRole(String idRl);
    GroupeRole create(GroupeRole groupeRole);
    GroupeRole update(String id, GroupeRole groupeRole);
    void delete(String id);
}
