package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.Profil;
import com.stockpro.entity.administration.Role;
import com.stockpro.entity.administration.UserSite;
import com.stockpro.entity.administration.UserSiteDroits;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.repository.administration.UserSiteDroitsRepository;
import com.stockpro.repository.administration.UserSiteRepository;
import com.stockpro.service.administration.UserSiteDroitsService;
import lombok.RequiredArgsConstructor;
import org.springframework.objenesis.instantiator.util.UnsafeUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSiteDroitsServiceImpl implements UserSiteDroitsService {

    private final UserSiteDroitsRepository userSiteDroitsRepository;
    private final UserSiteRepository userSiteRepository;
    private final RoleRepository roleRepository;
    private final ProfilRepository profilRepository;
    private final GroupeRepository groupeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDroits> findAll() {
        return userSiteDroitsRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSiteDroits> findAll(Pageable pageable) {
        return userSiteDroitsRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public UserSiteDroits findById(UUID id) {
        return userSiteDroitsRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("UserSiteDroits", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDroits> findByUserSite(UUID idUtilSite) {
        return userSiteDroitsRepository.findByUserSite_IdUtilSite(idUtilSite);
    }

    @Override
    public UserSiteDroits create(UserSiteDroits userSiteDroits) {
        userSiteDroits.setIdUserSiteDroit(null);
        resolveRelations(userSiteDroits);
        return userSiteDroitsRepository.save(userSiteDroits);
    }

    @Override
    public UserSiteDroits update(UUID id, UserSiteDroits userSiteDroits) {
        UserSiteDroits existing = findById(id);
        existing.setDateAffectation(userSiteDroits.getDateAffectation());
        resolveRelations(userSiteDroits);
        existing.setUserSite(userSiteDroits.getUserSite());
        existing.setRole(userSiteDroits.getRole());
        existing.setProfil(userSiteDroits.getProfil());
        existing.setGroupe(userSiteDroits.getGroupe());
        return userSiteDroitsRepository.save(existing);
    }

    @Override
    public void delete(UUID id) {
        UserSiteDroits existing = findById(id);
        userSiteDroitsRepository.delete(existing);
    }

    private void resolveRelations(UserSiteDroits userSiteDroits) {
        if (userSiteDroits.getUserSite() == null || userSiteDroits.getUserSite().getIdUtilSite() == null) {
            throw new IllegalArgumentException("Le userSite (idUtilSite) est obligatoire");
        }
        UserSite userSite = userSiteRepository.findById(userSiteDroits.getUserSite().getIdUtilSite().toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", userSiteDroits.getUserSite().getIdUtilSite()));
        userSiteDroits.setUserSite(userSite);

        if (userSiteDroits.getRole() != null && userSiteDroits.getRole().getIdRl() != null) {
            Role role = roleRepository.findById(userSiteDroits.getRole().getIdRl().toString().replace("-", " "))
                    .orElseThrow(() -> new ResourceNotFoundException("Role", userSiteDroits.getRole().getIdRl()));
            userSiteDroits.setRole(role);
        } else {
            userSiteDroits.setRole(null);
        }

        if (userSiteDroits.getProfil() != null && userSiteDroits.getProfil().getIdPr() != null) {
            Profil profil = profilRepository.findById(userSiteDroits.getProfil().getIdPr().toString().replace("-", " "))
                    .orElseThrow(() -> new ResourceNotFoundException("Profil", userSiteDroits.getProfil().getIdPr()));
            userSiteDroits.setProfil(profil);
        } else {
            userSiteDroits.setProfil(null);
        }

        if (userSiteDroits.getGroupe() != null && userSiteDroits.getGroupe().getIdGr() != null) {
            Groupe groupe = groupeRepository.findById(userSiteDroits.getGroupe().getIdGr().toString().replace("-", " "))
                    .orElseThrow(() -> new ResourceNotFoundException("Groupe", userSiteDroits.getGroupe().getIdGr()));
            userSiteDroits.setGroupe(groupe);
        } else {
            userSiteDroits.setGroupe(null);
        }
    }
}
