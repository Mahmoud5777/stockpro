package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.UserSiteDroitsDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.entity.administration.Profil;
import com.stockpro.entity.administration.Role;
import com.stockpro.entity.administration.UserSite;
import com.stockpro.entity.administration.UserSiteDroits;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.UserSiteDroitsMapper;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.repository.administration.ProfilRepository;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.repository.administration.UserSiteDroitsRepository;
import com.stockpro.repository.administration.UserSiteRepository;
import com.stockpro.service.administration.UserSiteDroitsService;
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
public class UserSiteDroitsServiceImpl implements UserSiteDroitsService {

    private final UserSiteDroitsRepository userSiteDroitsRepository;
    private final UserSiteRepository userSiteRepository;
    private final RoleRepository roleRepository;
    private final ProfilRepository profilRepository;
    private final GroupeRepository groupeRepository;
    private final UserSiteDroitsMapper mapper;

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
    public UserSiteDroitsDTO findById(UUID id) {
        return mapper.toDto(findEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSiteDroitsDTO> findByUserSite(UUID idUtilSite) {
        return userSiteDroitsRepository.findByUserSite_IdUtilSite(idUtilSite).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserSiteDroitsDTO create(UserSiteDroitsDTO dto) {
        UserSiteDroits droits = mapper.toEntity(dto);
        droits.setIdUserSiteDroit(null);
        resolveRelations(droits);
        return mapper.toDto(userSiteDroitsRepository.save(droits));
    }

    @Override
    public UserSiteDroitsDTO update(UUID id, UserSiteDroitsDTO dto) {
        UserSiteDroits existing = findEntityById(id);
        UserSiteDroits incoming = mapper.toEntity(dto);
        existing.setDateAffectation(incoming.getDateAffectation());
        resolveRelations(incoming);
        existing.setUserSite(incoming.getUserSite());
        existing.setRole(incoming.getRole());
        existing.setProfil(incoming.getProfil());
        existing.setGroupe(incoming.getGroupe());
        return mapper.toDto(userSiteDroitsRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        userSiteDroitsRepository.delete(findEntityById(id));
    }

    private UserSiteDroits findEntityById(UUID id) {
        return userSiteDroitsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("UserSiteDroits", id));
    }

    private void resolveRelations(UserSiteDroits droits) {
        if (droits.getUserSite() == null || droits.getUserSite().getIdUtilSite() == null) {
            throw new IllegalArgumentException("Le userSite (idUtilSite) est obligatoire");
        }
        UserSite userSite = userSiteRepository.findById(droits.getUserSite().getIdUtilSite())
                .orElseThrow(() -> new ResourceNotFoundException("UserSite", droits.getUserSite().getIdUtilSite()));
        droits.setUserSite(userSite);

        if (droits.getRole() != null && droits.getRole().getIdRl() != null) {
            Role role = roleRepository.findById(droits.getRole().getIdRl())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", droits.getRole().getIdRl()));
            droits.setRole(role);
        }
        if (droits.getProfil() != null && droits.getProfil().getIdPr() != null) {
            Profil profil = profilRepository.findById(droits.getProfil().getIdPr())
                    .orElseThrow(() -> new ResourceNotFoundException("Profil", droits.getProfil().getIdPr()));
            droits.setProfil(profil);
        }
        if (droits.getGroupe() != null && droits.getGroupe().getIdGr() != null) {
            Groupe groupe = groupeRepository.findById(droits.getGroupe().getIdGr())
                    .orElseThrow(() -> new ResourceNotFoundException("Groupe", droits.getGroupe().getIdGr()));
            droits.setGroupe(groupe);
        }
    }
}
