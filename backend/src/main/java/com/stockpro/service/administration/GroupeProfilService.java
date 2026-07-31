package com.stockpro.service.administration;

import com.stockpro.entity.administration.GroupeProfil;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroupeProfilService {
    List<GroupeProfil> findAll();
    Page<GroupeProfil> findAll(Pageable pageable);
    GroupeProfil findById(UUID id);
    List<GroupeProfil> findByGroupe(UUID idGr);
    List<GroupeProfil> findByProfil(UUID idPr);
    GroupeProfil create(GroupeProfil groupeProfil);
    GroupeProfil update(UUID id, GroupeProfil groupeProfil);
    void delete(UUID id);
}
