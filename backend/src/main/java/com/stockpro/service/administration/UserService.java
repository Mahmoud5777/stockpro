package com.stockpro.service.administration;

import com.stockpro.entity.administration.User;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<User> findAll();
    Page<User> findAll(Pageable pageable);
    Page<User> search(String query, Pageable pageable);
    User findById(UUID id);
    User findByLogin(String login);
    User create(User user);
    User update(UUID id, User user);
    void delete(UUID id);

    /**
     * Change le mot de passe (et optionnellement le login) de l'utilisateur courant,
     * après vérification du mot de passe actuel. Réinitialise DOIT_CHANGER_MDP à false.
     */
    User changeCredentials(UUID idUtil, String currentPassword, String newLogin, String newPassword);

    /**
     * Crée (ou réinitialise) un compte avec un mot de passe temporaire :
     * DOIT_CHANGER_MDP est forcé à true, l'utilisateur devra le changer à la prochaine connexion.
     */
    User createWithTemporaryPassword(User user, String temporaryPassword);
}
