package com.stockpro.service.administration;

import com.stockpro.dto.administration.SdDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SdService {
List<SdDTO> findAll();
    Page<SdDTO> findAll(Pageable pageable);
        Page<SdDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        SdDTO findById(UUID id);
                        SdDTO create(SdDTO dto);
                        SdDTO update(UUID id, SdDTO dto);
                        void delete(UUID id);
                        }