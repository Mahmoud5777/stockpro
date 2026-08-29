package com.stockpro.service.security;

import com.stockpro.dto.security.GroupDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GroupService {
List<GroupDTO> findAll();
    Page<GroupDTO> findAll(Pageable pageable);
        Page<GroupDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                List<GroupDTO> findAllForExport(String search, Map<String, String> filters);
                        GroupDTO findById(UUID id);
                        GroupDTO create(GroupDTO dto);
                        GroupDTO update(UUID id, GroupDTO dto);
                        void delete(UUID id);
                        }