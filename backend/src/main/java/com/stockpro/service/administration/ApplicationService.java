package com.stockpro.service.administration;

import com.stockpro.dto.administration.ApplicationDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ApplicationService {
    List<ApplicationDTO> findAll();
    Page<ApplicationDTO> findAll(Pageable pageable);
    Page<ApplicationDTO> search(String query, Pageable pageable);
    ApplicationDTO findById(UUID id);
    ApplicationDTO create(ApplicationDTO applicationDTO);
    ApplicationDTO update(UUID id, ApplicationDTO applicationDTO);
    void delete(UUID id);
}
