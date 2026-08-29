package com.stockpro.service.security.impl;

import com.stockpro.dto.security.UserSiteDroitsDTO;
import com.stockpro.entity.security.UserSiteDroits;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.UserSiteDroitsMapper;
import com.stockpro.repository.security.UserSiteDroitsRepository;
import com.stockpro.repository.security.UserSiteRepository;
import com.stockpro.repository.security.RoleRepository;
import com.stockpro.service.security.UserSiteDroitsService;
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
public class UserSiteDroitsServiceImpl implements UserSiteDroitsService {

private final UserSiteDroitsRepository userSiteDroitsRepository;
private final UserSiteDroitsMapper mapper;
private final UserSiteRepository userSiteRepository;
private final RoleRepository roleRepository;

private UserSite resolveUserSite(UUID id) {
    if (id == null) {
        return null;
    }
    return userSiteRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("UserSite", id));
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
public List<UserSiteDroitsDTO> findAll() {
    return userSiteDroitsRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSiteDroitsDTO> findAll(Pageable pageable) {
        return userSiteDroitsRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<UserSiteDroitsDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return userSiteDroitsRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<UserSiteDroitsDTO> findAllForExport(String search, Map<String, String> filters) {
                        return userSiteDroitsRepository.findAll().stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public UserSiteDroitsDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public UserSiteDroitsDTO create(UserSiteDroitsDTO dto) {
                        UserSiteDroits entity = mapper.toEntity(dto);
                        entity.setId(null);
                        entity.setUserSite(resolveUserSite(dto.getUserSiteId()));
                        entity.setRole(resolveRole(dto.getRoleId()));
                        return mapper.toDto(userSiteDroitsRepository.save(entity));
                        }

                        @Override
                        public UserSiteDroitsDTO update(UUID id, UserSiteDroitsDTO dto) {
                        UserSiteDroits existing = getEntity(id);
                        existing.setCodeDroit(dto.getCodeDroit());
                        existing.setLibelleDroit(dto.getLibelleDroit());
                        existing.setEstExporte(dto.getEstExporte());
                        existing.setUserSite(resolveUserSite(dto.getUserSiteId()));
                        existing.setRole(resolveRole(dto.getRoleId()));
                        return mapper.toDto(userSiteDroitsRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        userSiteDroitsRepository.delete(getEntity(id));
                        }

                        private UserSiteDroits getEntity(UUID id) {
                        return userSiteDroitsRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("UserSiteDroits", id));
                        }
                        }