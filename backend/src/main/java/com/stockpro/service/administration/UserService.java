package com.stockpro.service.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserService {
    List<UserDTO> findAll();
    Page<UserDTO> findAll(Pageable pageable);

    // Recherche unifiée (texte + filtres) pilotée par FilterDefinitions.UTILISATEUR
    Page<UserDTO> findAll(String search, Map<String, String> filters, Pageable pageable);

    UserDTO findById(UUID id);
    UserDTO findByLogin(String login);
    UserDTO create(UserDTO user);
    UserDTO update(UUID id, UserDTO user);
    void delete(UUID id);
    UserDTO changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword);
    UserDTO createWithTemporaryPassword(UserDTO user, String temporaryPassword);
}