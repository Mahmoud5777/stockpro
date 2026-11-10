package com.stockpro.service.administration;

import com.stockpro.dto.administration.ProfilDroitDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProfilDroitService {
    List<ProfilDroitDTO> findAll();
    Page<ProfilDroitDTO> findAll(Pageable pageable);
    ProfilDroitDTO findById(UUID id);
    List<ProfilDroitDTO> findByProfil(UUID idPr);
    ProfilDroitDTO create(ProfilDroitDTO dto);
    ProfilDroitDTO update(UUID id, ProfilDroitDTO dto);
    void delete(UUID id);
}
