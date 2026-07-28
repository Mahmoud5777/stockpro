package com.stockpro.security;

import com.stockpro.dto.auth.FonctionnaliteAvecDroitsDTO;
import com.stockpro.entity.administration.User;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.service.auth.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Point d'entrée unique pour le contrôle d'autorisation métier au niveau des contrôleurs
 * (@PreAuthorize("@accessGuard.can(authentication, 'CODE_FONCTIONNALITE', 'action')")).
 * <p>
 * Avant cette classe, seul l'endpoint /api/auth/me exposait les droits calculés par
 * {@link AuthorizationService} ; aucun contrôleur ne les vérifiait réellement, ce qui
 * permettait à n'importe quel utilisateur authentifié d'appeler n'importe quel endpoint
 * d'administration indépendamment de ses droits réels.
 */
@Component("accessGuard")
@RequiredArgsConstructor
public class AccessGuard {

    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    public boolean can(Authentication authentication, String codeFonctionnalite, String action) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        User user = userRepository.findByLogin(authentication.getName()).orElse(null);
        if (user == null) {
            return false;
        }

        List<FonctionnaliteAvecDroitsDTO> fonctionnalites = authorizationService.resolveFonctionnalites(user.getIdUtil());
        return fonctionnalites.stream()
                .filter(f -> codeFonctionnalite.equals(f.getCodFonctionnalite()))
                .findFirst()
                .map(f -> hasAction(f, action))
                .orElse(false);
    }

    private boolean hasAction(FonctionnaliteAvecDroitsDTO fonctionnalite, String action) {
        if (fonctionnalite.getDroits() == null) return false;
        return switch (action.toUpperCase()) {
            case "CONSULTATION" -> fonctionnalite.getDroits().isConsultation();
            case "AJOUT" -> fonctionnalite.getDroits().isAjout();
            case "MODIFICATION" -> fonctionnalite.getDroits().isModification();
            case "SUPPRESSION" -> fonctionnalite.getDroits().isSuppression();
            case "EXPORT" -> fonctionnalite.getDroits().isExport();
            case "IMPRESSION" -> fonctionnalite.getDroits().isImpression();
            default -> false;
        };
    }
}
