package com.stockpro.service.administration;

import com.stockpro.dto.administration.ZeDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ZeService {
List<ZeDTO> findAll();
    Page<ZeDTO> findAll(Pageable pageable);
        Page<ZeDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        ZeDTO findById(UUID id);
                        ZeDTO create(ZeDTO dto);
                        ZeDTO update(UUID id, ZeDTO dto);
                        void delete(UUID id);
                        }