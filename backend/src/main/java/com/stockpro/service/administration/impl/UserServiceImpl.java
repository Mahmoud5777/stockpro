package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.User;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.service.administration.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> findAll(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<User> search(String query, Pageable pageable) {
        return userRepository.findByNomCompletContainingIgnoreCaseOrLoginContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Override
    @Transactional(readOnly = true)
    public User findByLogin(String login) {
        return userRepository.findByLogin(login)
                .orElseThrow(() -> new ResourceNotFoundException("User avec login " + login + " introuvable"));
    }

    @Override
    public User create(User user) {
        user.setIdUtil(null);
        if (user.getMotPasse() == null || user.getMotPasse().isBlank()) {
            throw new IllegalArgumentException("Le mot de passe est obligatoire à la création");
        }
        user.setMotPasse(passwordEncoder.encode(user.getMotPasse()));
        if (user.getEtatCompte() == null) {
            user.setEtatCompte(true);
        }
        return userRepository.save(user);
    }

    @Override
    public User update(UUID id, User user) {
        User existing = findById(id);
        existing.setNomComplet(user.getNomComplet());
        existing.setLogin(user.getLogin());
        if (user.getMotPasse() != null && !user.getMotPasse().isBlank()) {
            existing.setMotPasse(passwordEncoder.encode(user.getMotPasse()));
        }
        existing.setEmail(user.getEmail());
        existing.setTelephone(user.getTelephone());
        existing.setEtatCompte(user.getEtatCompte());
        return userRepository.save(existing);
    }

    @Override
    public void delete(UUID id) {
        User existing = findById(id);
        userRepository.delete(existing);
    }

    @Override
    public User changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword) {
        User existing = findById(idUtil);

        if (!passwordEncoder.matches(currentPassword, existing.getMotPasse())) {
            throw new BadCredentialsException("Mot de passe actuel incorrect");
        }

        if (newLogin != null && !newLogin.isBlank()) {
            existing.setLogin(newLogin);
        }
        existing.setMotPasse(passwordEncoder.encode(newPassword));
        existing.setDoitChangerMdp(false);
        return userRepository.save(existing);
    }

    @Override
    public User createWithTemporaryPassword(User user, String temporaryPassword) {
        user.setIdUtil(null);
        user.setMotPasse(passwordEncoder.encode(temporaryPassword));
        user.setDoitChangerMdp(true);
        if (user.getEtatCompte() == null) {
            user.setEtatCompte(true);
        }
        return userRepository.save(user);
    }
}
