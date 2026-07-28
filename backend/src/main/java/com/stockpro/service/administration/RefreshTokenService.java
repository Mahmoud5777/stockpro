package com.stockpro.service.administration;

import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;

public interface RefreshTokenService {

    /** Crée et persiste un nouveau refresh token pour l'utilisateur donné. */
    RefreshToken create(User user);

    /** Recherche un refresh token par sa valeur, échoue si introuvable. */
    RefreshToken findByToken(String token);

    /** Vérifie que le token n'est ni expiré ni révoqué ; lève une exception sinon. */
    RefreshToken verify(RefreshToken token);

    /** Révoque (invalide) un refresh token donné — utilisé au logout. */
    void revoke(RefreshToken token);

    /** Révoque tous les refresh tokens actifs d'un utilisateur (ex: changement de mot de passe). */
    void revokeAllForUser(User user);

    /** Rotation : révoque l'ancien token et en crée un nouveau pour le même utilisateur. */
    RefreshToken rotate(RefreshToken oldToken);
}
