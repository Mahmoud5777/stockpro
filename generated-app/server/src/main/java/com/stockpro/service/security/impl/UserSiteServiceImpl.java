package com.stockpro.service.security.impl;

import com.stockpro.dto.security.UserSiteDTO;
import com.stockpro.entity.security.UserSite;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.security.UserSiteMapper;
import com.stockpro.repository.security.UserSiteRepository;
import com.stockpro.repository.security.UserRepository;
import com.stockpro.repository.security.SiteRepository;
import com.stockpro.service.security.UserSiteService;
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
public class UserSiteServiceImpl implements UserSiteService {

private final UserSiteRepository userSiteRepository;
private final UserSiteMapper mapper;
private final UserRepository userRepository;
private final SiteRepository siteRepository;

private User resolveUser(UUID id) {
    if (id == null) {
        return null;
    }
    return userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User", id));
}

private Site resolveSite(UUID id) {
    if (id == null) {
        return null;
    }
    return siteRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Site", id));
}

@Override
@Transactional(readOnly = true)
public List<UserSiteDTO> findAll() {
    return userSiteRepository.findAll().stream()
    .map(mapper::toDto)
    .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSiteDTO> findAll(Pageable pageable) {
        return userSiteRepository.findAll(pageable).map(mapper::toDto);
        }

        @Override
        @Transactional(readOnly = true)
        public Page<UserSiteDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
                return userSiteRepository.findAll(pageable).map(mapper::toDto);
                }


                        @Override
                        @Transactional(readOnly = true)
                        public UserSiteDTO findById(UUID id) {
                        return mapper.toDto(getEntity(id));
                        }

                        @Override
                        public UserSiteDTO create(UserSiteDTO dto) {
                        UserSite entity = mapper.toEntity(dto);
                        entity.setId(null);
                        entity.setUser(resolveUser(dto.getUserId()));
                        entity.setSite(resolveSite(dto.getSiteId()));
                        return mapper.toDto(userSiteRepository.save(entity));
                        }

                        @Override
                        public UserSiteDTO update(UUID id, UserSiteDTO dto) {
                        UserSite existing = getEntity(id);
                        existing.setRoleUtilisateur(dto.getRoleUtilisateur());
                        existing.setDateAffectation(dto.getDateAffectation());
                        existing.setUser(resolveUser(dto.getUserId()));
                        existing.setSite(resolveSite(dto.getSiteId()));
                        return mapper.toDto(userSiteRepository.save(existing));
                        }

                        @Override
                        public void delete(UUID id) {
                        userSiteRepository.delete(getEntity(id));
                        }

                        private UserSite getEntity(UUID id) {
                        return userSiteRepository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("UserSite", id));
                        }
                        }