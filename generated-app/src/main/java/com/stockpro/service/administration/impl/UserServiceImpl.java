package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.UserMapper;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.service.administration.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Page<UserDTO> findAll(String search, Boolean etatCompte, UUID siteId, Pageable pageable) {
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasFilter = etatCompte != null || siteId != null;

        if (!hasSearch && !hasFilter) {
            return userMapper.toDtoPage(userRepository.findAll(pageable));
        }
        return userMapper.toDtoPage(userRepository.findAllWithFilters(
                hasSearch ? search : null,
                etatCompte,
                siteId,
                pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findById(UUID id) {
        return userMapper.toDto(getEntity(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO findByLogin(String login) {
        return userMapper.toDto(userRepository.findByLogin(login)
                .orElseThrow(() -> new ResourceNotFoundException("User avec login " + login + " introuvable")));
    }

    @Override
    public UserDTO create(UserDTO dto) {
        dto.setIdUtil(null);
        if (dto.getMotPasse() == null || dto.getMotPasse().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire à la création");
        }
        dto.setMotPasse(passwordEncoder.encode(dto.getMotPasse()));
        if (dto.getEtatCompte() == null) {
            dto.setEtatCompte(true);
        }
        return userMapper.toDto(userRepository.save(userMapper.toEntity(dto)));
    }

    @Override
    public UserDTO update(UUID id, UserDTO dto) {
        User existing = getEntity(id);
        existing.setNomComplet(dto.getNomComplet());
        existing.setLogin(dto.getLogin());
        if (dto.getMotPasse() != null && !dto.getMotPasse().isBlank()) {
            existing.setMotPasse(passwordEncoder.encode(dto.getMotPasse()));
        }
        existing.setEmail(dto.getEmail());
        existing.setTelephone(dto.getTelephone());
        existing.setEtatCompte(dto.getEtatCompte());
        return userMapper.toDto(userRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        userRepository.delete(getEntity(id));
    }

    @Override
    public UserDTO changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword) {
        User existing = getEntity(idUtil);

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

    private User getEntity(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
