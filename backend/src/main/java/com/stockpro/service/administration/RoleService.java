package com.stockpro.service.administration;

import com.stockpro.dto.administration.RoleDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    List<RoleDTO> findAll();
    Page<RoleDTO> findAll(Pageable pageable);
    Page<RoleDTO> search(String query, Pageable pageable);
    RoleDTO findById(UUID id);
    RoleDTO create(RoleDTO dto);
    RoleDTO update(UUID id, RoleDTO dto);
    void delete(UUID id);
}