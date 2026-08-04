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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSiteServiceImpl implements UserSiteService {

    private final UserSiteRepository userSiteRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final UserSiteMapper uSM;

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDTO> findAll() {
        return uSM.toDto(userSiteRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSiteDTO> findAll(Pageable pageable) {
        return uSM.toDto(userSiteRepository.findAll(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public UserSiteDTO findById(UUID id) {
        return uSM.toDto(userSiteRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDTO> findByUser(UUID idUtil) {
        return uSM.toDto(userSiteRepository.findByUser_IdUtil(idUtil));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDTO> findBySite(UUID idSite) {
        return uSM.toDto(userSiteRepository.findBySite_IdSite(idSite));
    }

    @Override
    public UserSiteDTO create(UserSiteDTO userSite) {
        userSite.setIdUtilSite(null);
        resolveRelations(uSM.toEntity(userSite));
        UserSite userSiteEntity = uSM.toEntity(userSite);

        UserSite savedUserSite = userSiteRepository.save(userSiteEntity);
        return uSM.toDto(userSiteRepository.save(savedUserSite));
    }
    @Override
    public UserSiteDTO update(UUID id, UserSiteDTO dto) {
        UserSite existing = uSM.toEntity(findById(id));

        existing.setDateAffectation(dto.getDateAffectation());

        // Convert DTO → entity just to resolve the relations
        UserSite temp = uSM.toEntity(dto);
        resolveRelations(temp);

        existing.setUser(temp.getUser());
        existing.setSite(temp.getSite());

        return uSM.toDto(userSiteRepository.save(existing));
    }
    @Override
    public void delete(UUID id) {
        UserSite existing = uSM.toEntity(findById(id));
        userSiteRepository.delete(existing);
    }

    private void resolveRelations(UserSite userSite) {
        if (userSite.getUser() == null || userSite.getUser().getIdUtil() == null) {
            throw new IllegalArgumentException("L'utilisateur (idUtil) est obligatoire");
        }
        User user = userRepository.findById(userSite.getIdUtilSite())
                .orElseThrow(() -> new ResourceNotFoundException("User", userSite.getUser().getIdUtil()));
        userSite.setUser(user);

        if (userSite.getSite() == null || userSite.getSite().getIdSite() == null) {
            throw new IllegalArgumentException("Le site (idSite) est obligatoire");
        }
        Site site = siteRepository.findById(userSite.getSite().getIdSite())
                .orElseThrow(() -> new ResourceNotFoundException("Site", userSite.getSite().getIdSite()));
        userSite.setSite(site);
    }
}
