package com.stockpro.service.security.impl;

import com.stockpro.dto.security.UserDTO;
import com.stockpro.entity.security.User;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.UserMapper;
import com.stockpro.repository.security.UserRepository;
import com.stockpro.repository.security.SiteRepository;
import com.stockpro.service.security.UserService;
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
public class UserServiceImpl implements UserService {

private final UserRepository userRepository;
private final UserMapper mapper;
private final SiteRepository siteRepository;

private Site resolveSite(UUID id) {
    if (id == null) {
        return null;
    }
    return siteRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site", id));
}

@Override
@Transactional(readOnly = true)
public List<UserDTO> findAll() {
    return userRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<UserDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return userRepository.findAll(pageable).map(mapper::toDto);
                }

                @Override
                @Transactional(readOnly = true)
                public List<UserDTO> findAllForExport(String search, Map<String, String> filters) {
                        return userRepository.findAll().stream()
                        .map(mapper::toDto)
                        .collect(Collectors.toList());
                        }

                        @Override
                        @Transactional(readOnly = true)
                        public UserDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public UserDTO create(UserDTO dto) {
                        User entity = mapper.toEntity(dto);
                        entity.setId(null);
                        if (dto.getSiteId() != null) {
                            entity.setSite(resolveSite(dto.getSiteId()));
                        }
                        return mapper.toDto(userRepository.save(entity));
                        }

                        @Override
                        public UserDTO update(UUID id, UserDTO dto) {
                        User existing = getEntity(id);
                        existing.setPrenom(dto.getPrenom());
                        existing.setNom(dto.getNom());
                        existing.setEstActif(dto.getEstActif());
                        if (dto.getSiteId() != null) {
                            existing.setSite(resolveSite(dto.getSiteId()));
                        }
                        return mapper.toDto(userRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        userRepository.delete(getEntity(id));
                        }

                        private User getEntity(UUID id) {
                        return userRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("User", id));
                        }
                        }