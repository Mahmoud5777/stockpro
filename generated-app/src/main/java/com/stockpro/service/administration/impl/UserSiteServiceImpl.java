package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.UserSiteDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import com.stockpro.entity.administration.UserSite;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.UserSiteMapper;
import com.stockpro.repository.administration.SiteRepository;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.repository.administration.UserSiteRepository;
import com.stockpro.service.administration.UserSiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSiteServiceImpl implements UserSiteService {

    private final UserSiteRepository userSiteRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final UserSiteMapper mapper;

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
    public UserSiteDTO findById(UUID id) {
        return mapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDTO> findByUser(UUID idUtil) {
        return userSiteRepository.findByUser_IdUtil(idUtil).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDTO> findBySite(UUID idSite) {
        return userSiteRepository.findBySite_IdSite(idSite).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserSiteDTO create(UserSiteDTO dto) {
        UserSite userSite = mapper.toEntity(dto);
        userSite.setIdUtilSite(null);
        userSite.setUser(resolveUser(dto.getIdUtil()));
        userSite.setSite(resolveSite(dto.getIdSite()));
        return mapper.toDto(userSiteRepository.save(userSite));
    }

    @Override
    public UserSiteDTO update(UUID id, UserSiteDTO dto) {
        UserSite existing = findEntityById(id);
        existing.setUser(resolveUser(dto.getIdUtil()));
        existing.setSite(resolveSite(dto.getIdSite()));
        existing.setDateAffectation(dto.getDateAffectation());
        return mapper.toDto(userSiteRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        userSiteRepository.delete(findEntityById(id));
    }

    private UserSite findEntityById(UUID id) {
        return userSiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", id));
    }

    private User resolveUser(UUID idUtil) {
        if (idUtil == null) {
            throw new IllegalArgumentException("L'utilisateur (idUtil) est obligatoire");
        }
        return userRepository.findById(idUtil)
                .orElseThrow(() -> new ResourceNotFoundException("User", idUtil));
    }

    private Site resolveSite(UUID idSite) {
        if (idSite == null) {
            throw new IllegalArgumentException("Le site (idSite) est obligatoire");
        }
        return siteRepository.findById(idSite)
                .orElseThrow(() -> new ResourceNotFoundException("Site", idSite));
    }
}
