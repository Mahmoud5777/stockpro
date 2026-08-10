package com.stockpro.service.administration.impl;

import com.stockpro.config.FilterDefinitions;
import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.service.administration.UserService;
import com.stockpro.util.EntitySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stockpro.mapper.administration.UserMapper;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> findAll() {
        return  userMapper.toDtoList(userRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        return userMapper.toDtoPage(userRepository.findAll(pageable));
    }

    // ═══ Recherche unifiée : texte + filtres, moteur universel ═══
    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(String search, Map<String, String> filters, Pageable pageable) {
        return EntitySpecifications.findAll(userRepository, FilterDefinitions.UTILISATEUR, search, filters, pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        return userMapper.toDto(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByLogin(String login) {
        return userMapper.toDto(userRepository.findByLogin(login)
                .orElseThrow(() -> new ResourceNotFoundException("User avec login " + login + " introuvable")));
    }

    @Override
    public UserDTO create(UserDTO user) {
        user.setIdUtil(null);
        if (user.getMotPasse() == null || user.getMotPasse().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire à la création");
        }
        user.setMotPasse(passwordEncoder.encode(user.getMotPasse()));
        if (user.getEtatCompte() == null) {
            user.setEtatCompte(true);
        }
        // Convert DTO → Entity
        User entity = userMapper.toEntity(user);  // or modelMapper.map(...)

// Save the entity
        User saved = userRepository.save(entity);

// Convert back Entity → DTO
        return userMapper.toDto(saved);

    }

    @Override
    public UserDTO update(UUID id, UserDTO user) {
        User entity = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        entity.setNomComplet(user.getNomComplet());
        entity.setLogin(user.getLogin());
        if (user.getMotPasse() != null && !user.getMotPasse().isBlank()) {
            entity.setMotPasse(passwordEncoder.encode(user.getMotPasse()));
        }
        entity.setEmail(user.getEmail());
        entity.setTelephone(user.getTelephone());
        entity.setEtatCompte(user.getEtatCompte());
        return userMapper.toDto(userRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        UserDTO existing = findById(id);
        userRepository.delete(userMapper.toEntity(existing));
    }

    @Override
    public UserDTO changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword) {
        // Le DTO ne transporte JAMAIS motPasse (voir UserMapper.toDto) : on passe
        // par l'entité pour vérifier l'ancien mot de passe contre le hash réel.
        User existing = userRepository.findById(idUtil)
                .orElseThrow(() -> new ResourceNotFoundException("User", idUtil));

        if (!passwordEncoder.matches(currentPassword, existing.getMotPasse())) {
            throw new BadCredentialsException("Mot de passe actuel incorrect");
        }

        if (newLogin != null && !newLogin.isBlank()) {
            existing.setLogin(newLogin);
        }
        existing.setMotPasse(passwordEncoder.encode(newPassword));

        existing.setDoitChangerMdp(false);

        return userMapper.toDto(userRepository.save(existing));
    }

    @Override
    public UserDTO createWithTemporaryPassword(UserDTO user, String temporaryPassword) {
        user.setIdUtil(null);
        user.setMotPasse(passwordEncoder.encode(temporaryPassword));
        user.setDoitChangerMdp(true);
        if (user.getEtatCompte() == null) {
            user.setEtatCompte(true);
        }
        // Convert DTO → Entity
        User entity = userMapper.toEntity(user);  // or modelMapper.map(...)

// Save the entity
        User saved = userRepository.save(entity);

// Convert back Entity → DTO
        return userMapper.toDto(saved);

    }
}