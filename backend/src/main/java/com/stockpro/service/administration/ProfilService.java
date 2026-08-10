package com.stockpro.service.administration;

import com.stockpro.dto.administration.ProfilDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ProfilService {
    List<ProfilDTO> findAll();
    Page<ProfilDTO> findAll(Pageable pageable);
    Page<ProfilDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
    ProfilDTO findById(UUID id);
    ProfilDTO create(ProfilDTO dto);
    ProfilDTO update(UUID id, ProfilDTO dto);
    void delete(UUID id);
}