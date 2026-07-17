package com.stockpro.stockpro.service.administration.impl;

import com.stockpro.stockpro.entity.administration.Site;
import com.stockpro.stockpro.entity.administration.User;
import com.stockpro.stockpro.entity.administration.UserSite;
import com.stockpro.stockpro.exception.ResourceNotFoundException;
import com.stockpro.stockpro.repository.administration.SiteRepository;
import com.stockpro.stockpro.repository.administration.UserRepository;
import com.stockpro.stockpro.repository.administration.UserSiteRepository;
import com.stockpro.stockpro.service.administration.UserSiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSiteServiceImpl implements UserSiteService {

    private final UserSiteRepository userSiteRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSite> findAll() {
        return userSiteRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSite> findAll(Pageable pageable) {
        return userSiteRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSite findById(String id) {
        return userSiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSite> findByUser(String idUtil) {
        return userSiteRepository.findByUser_IdUtil(idUtil);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSite> findBySite(String idSite) {
        return userSiteRepository.findBySite_IdSite(idSite);
    }

    @Override
    public UserSite create(UserSite userSite) {
        userSite.setIdUtilSite(null);
        resolveRelations(userSite);
        return userSiteRepository.save(userSite);
    }

    @Override
    public UserSite update(String id, UserSite userSite) {
        UserSite existing = findById(id);
        existing.setDateAffectation(userSite.getDateAffectation());
        resolveRelations(userSite);
        existing.setUser(userSite.getUser());
        existing.setSite(userSite.getSite());
        return userSiteRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        UserSite existing = findById(id);
        userSiteRepository.delete(existing);
    }

    private void resolveRelations(UserSite userSite) {
        if (userSite.getUser() == null || userSite.getUser().getIdUtil() == null) {
            throw new IllegalArgumentException("L'utilisateur (idUtil) est obligatoire");
        }
        User user = userRepository.findById(userSite.getUser().getIdUtil())
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
