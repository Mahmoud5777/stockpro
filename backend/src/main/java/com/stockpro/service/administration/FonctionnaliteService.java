package com.stockpro.service.administration;

import com.stockpro.dto.administration.FonctionnaliteDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface FonctionnaliteService {
    List<FonctionnaliteDTO> findAll();
    Page<FonctionnaliteDTO> findAll(Pageable pageable);
    Page<FonctionnaliteDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
    List<FonctionnaliteDTO> findAllForExport(String search, Map<String, String> filters);
    FonctionnaliteDTO findById(UUID id);
    List<FonctionnaliteDTO> findByApplication(UUID idApp);
    List<FonctionnaliteDTO> findRacines();
    FonctionnaliteDTO create(FonctionnaliteDTO fonctionnaliteDTO);
    FonctionnaliteDTO update(UUID id, FonctionnaliteDTO fonctionnaliteDTO);
    void delete(UUID id);
}
