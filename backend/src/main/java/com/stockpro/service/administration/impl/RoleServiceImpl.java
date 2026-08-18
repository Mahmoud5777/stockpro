package com.stockpro.service.administration.impl;

import com.stockpro.config.FilterDefinitions;
import com.stockpro.dto.administration.RoleDTO;
import com.stockpro.entity.administration.Role;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.RoleMapper;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.service.administration.RoleService;
import com.stockpro.util.EntitySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> findAll() {
        return roleRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoleDTO> findAll(Pageable pageable) {
        return roleRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoleDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
        return EntitySpecifications.findAll(roleRepository, FilterDefinitions.ROLE, search, filters, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> findAllForExport(String search, Map<String, String> filters) {
        return EntitySpecifications.findAllList(roleRepository, FilterDefinitions.ROLE, search, filters)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    public RoleDTO create(RoleDTO dto) {
        Role role = mapper.toEntity(dto);
        role.setIdRl(null);
        return mapper.toDto(roleRepository.save(role));
    }

    @Override
    public RoleDTO update(UUID id, RoleDTO dto) {
        Role existing = getEntity(id);
        existing.setCodeRole(dto.getCodeRole());
        existing.setLibelle(dto.getLibelle());
        existing.setDescription(dto.getDescription());
        return mapper.toDto(roleRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        roleRepository.delete(getEntity(id));
    }

    private Role getEntity(UUID id) {
        return roleRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }
}