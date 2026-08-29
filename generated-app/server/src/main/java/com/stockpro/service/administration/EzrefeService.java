package com.stockpro.service.administration;

import com.stockpro.dto.administration.EzrefeDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface EzrefeService {
List<EzrefeDTO> findAll();
    Page<EzrefeDTO> findAll(Pageable pageable);
        Page<EzrefeDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        EzrefeDTO findById(UUID id);
                        EzrefeDTO create(EzrefeDTO dto);
                        EzrefeDTO update(UUID id, EzrefeDTO dto);
                        void delete(UUID id);
                        }