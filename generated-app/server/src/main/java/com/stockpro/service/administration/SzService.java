package com.stockpro.service.administration;

import com.stockpro.dto.administration.SzDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SzService {
List<SzDTO> findAll();
    Page<SzDTO> findAll(Pageable pageable);
        Page<SzDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        SzDTO findById(UUID id);
                        SzDTO create(SzDTO dto);
                        SzDTO update(UUID id, SzDTO dto);
                        void delete(UUID id);
                        }