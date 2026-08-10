package com.stockpro.service.administration;

import com.stockpro.dto.administration.GroupeDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface GroupeService {
    List<GroupeDTO> findAll();
    Page<GroupeDTO> findAll(Pageable pageable);
    Page<GroupeDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
    GroupeDTO findById(UUID id);
    GroupeDTO create(GroupeDTO groupeDTO);
    GroupeDTO update(UUID id, GroupeDTO groupeDTO);
    void delete(UUID id);
}
