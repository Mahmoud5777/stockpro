package com.stockpro.service.administration;

import com.stockpro.dto.administration.ErzrDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ErzrService {
List<ErzrDTO> findAll();
    Page<ErzrDTO> findAll(Pageable pageable);
        Page<ErzrDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        ErzrDTO findById(UUID id);
                        ErzrDTO create(ErzrDTO dto);
                        ErzrDTO update(UUID id, ErzrDTO dto);
                        void delete(UUID id);
                        }