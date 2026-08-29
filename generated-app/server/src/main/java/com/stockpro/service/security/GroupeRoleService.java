package com.stockpro.service.security;

import com.stockpro.dto.security.GroupeRoleDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GroupeRoleService {
List<GroupeRoleDTO> findAll();
    Page<GroupeRoleDTO> findAll(Pageable pageable);
        Page<GroupeRoleDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        GroupeRoleDTO findById(UUID id);
                        GroupeRoleDTO create(GroupeRoleDTO dto);
                        GroupeRoleDTO update(UUID id, GroupeRoleDTO dto);
                        void delete(UUID id);
                        }