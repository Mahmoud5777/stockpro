package com.stockpro.security;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.service.audit.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AbstractAuthenticationFailureEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Se branche directement sur les évènements publiés par le
 * {@link org.springframework.security.authentication.AuthenticationManager} lors de chaque
 * appel à authenticate() (donc à chaque tentative de login). Fonctionne indépendamment
 * du contrôleur — c'est l'approche idiomatique Spring Security pour l'audit d'authentification.
 */
@Component
@RequiredArgsConstructor
public class AuditAuthenticationEventListener {

    private final AuditService auditService;

    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        String login = event.getAuthentication().getName();
        auditService.log(AuditAction.LOGIN_SUCCESS, login, null, currentRequest(), 200, null);
    }

    @EventListener
    public void onFailure(AbstractAuthenticationFailureEvent event) {
        String login = String.valueOf(event.getAuthentication().getPrincipal());
        String reason = event.getException().getMessage();
        auditService.log(AuditAction.LOGIN_FAILURE, login, null, currentRequest(), 401, reason);
    }

    private HttpServletRequest currentRequest() {
        try {
            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            return attrs.getRequest();
        } catch (IllegalStateException e) {
            // Pas de requête HTTP en cours (ex: authentification programmatique hors requête)
            return null;
        }
    }
}
