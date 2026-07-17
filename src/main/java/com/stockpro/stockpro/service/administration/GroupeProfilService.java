package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.GroupeProfil;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GroupeProfilService {
    List<GroupeProfil> findAll();
    Page<GroupeProfil> findAll(Pageable pageable);
    GroupeProfil findById(String id);
    List<GroupeProfil> findByGroupe(String idGr);
    List<GroupeProfil> findByProfil(String idPr);
    GroupeProfil create(GroupeProfil groupeProfil);
    GroupeProfil update(String id, GroupeProfil groupeProfil);
    void delete(String id);
}
