package com.stockpro.service.administration;

import com.stockpro.entity.administration.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<User> findAll();
    Page<User> findAll(Pageable pageable);

    // NOUVEAU : endpoint unifié recherche + filtres
    Page<User> findAll(String search, Boolean etatCompte, UUID siteId, Pageable pageable);

    Page<User> search(String query, Pageable pageable);
    User findById(UUID id);
    User findByLogin(String login);
    User create(User user);
    User update(UUID id, User user);
    void delete(UUID id);
    User changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword);
    User createWithTemporaryPassword(User user, String temporaryPassword);
}