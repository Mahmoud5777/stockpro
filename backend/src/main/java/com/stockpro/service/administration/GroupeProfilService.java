package com.stockpro.service.administration;

import com.stockpro.dto.administration.GroupeProfilDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface GroupeProfilService {
    List<GroupeProfilDTO> findAll();
    Page<GroupeProfilDTO> findAll(Pageable pageable);
    GroupeProfilDTO findById(UUID id);
    List<GroupeProfilDTO> findByGroupe(UUID idGr);
    List<GroupeProfilDTO> findByProfil(UUID idPr);
    GroupeProfilDTO create(GroupeProfilDTO groupeProfilDTO);
    GroupeProfilDTO update(UUID id, GroupeProfilDTO groupeProfilDTO);
    void delete(UUID id);
}
