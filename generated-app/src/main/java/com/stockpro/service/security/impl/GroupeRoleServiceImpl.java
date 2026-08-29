package com.stockpro.service.security.impl;

import com.stockpro.dto.security.GroupeRoleDTO;
import com.stockpro.entity.security.GroupeRole;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.GroupeRoleMapper;
import com.stockpro.repository.security.GroupeRoleRepository;
import com.stockpro.repository.security.GroupRepository;
import com.stockpro.repository.security.RoleRepository;
import com.stockpro.service.security.GroupeRoleService;
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
public class GroupeRoleServiceImpl implements GroupeRoleService {

private final GroupeRoleRepository groupRoleRepository;
private final GroupeRoleMapper mapper;
private final GroupRepository groupRepository;
private final RoleRepository roleRepository;

private Group resolveGroup(UUID id) {
    if (id == null) {
        return null;
    }
    return groupRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Group", id));
}

private Role resolveRole(UUID id) {
    if (id == null) {
        return null;
    }
    return roleRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Role", id));
}

@Override
@Transactional(readOnly = true)
public List<GroupeRoleDTO> findAll() {
    return groupRoleRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeRoleDTO> findAll(Pageable pageable) {
        return groupRoleRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<GroupeRoleDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return groupRoleRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public GroupeRoleDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public GroupeRoleDTO create(GroupeRoleDTO dto) {
                        GroupeRole entity = mapper.toEntity(dto);
                        entity.setId(null);
                        entity.setGroup(resolveGroup(dto.getGroupId()));
                        entity.setRole(resolveRole(dto.getRoleId()));
                        return mapper.toDto(groupRoleRepository.save(entity));
                        }

                        @Override
                        public GroupeRoleDTO update(UUID id, GroupeRoleDTO dto) {
                        GroupeRole existing = getEntity(id);
                        existing.setGroup(resolveGroup(dto.getGroupId()));
                        existing.setRole(resolveRole(dto.getRoleId()));
                        return mapper.toDto(groupRoleRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        groupRoleRepository.delete(getEntity(id));
                        }

                        private GroupeRole getEntity(UUID id) {
                        return groupRoleRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("GroupeRole", id));
                        }
                        }