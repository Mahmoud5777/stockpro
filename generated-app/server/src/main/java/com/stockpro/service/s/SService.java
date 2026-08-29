package com.stockpro.service.s;

import com.stockpro.dto.s.SDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface SService {
List<SDTO> findAll();
    Page<SDTO> findAll(Pageable pageable);
        Page<SDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        SDTO findById(UUID id);
                        SDTO create(SDTO dto);
                        SDTO update(UUID id, SDTO dto);
                        void delete(UUID id);
                        }