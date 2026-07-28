package com.stockpro.security;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.service.audit.AuditService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Journalise chaque appel à l'API (hors authentification, déjà couverte par
 * {@link AuditAuthenticationEventListener}, et hors endpoints "bruyants" comme Swagger).
 * Placé après {@link JwtAuthenticationFilter} dans la chaîne pour connaître l'utilisateur authentifié.
 */
@Component
@RequiredArgsConstructor
public class AuditLoggingFilter extends OncePerRequestFilter {

    private final AuditService auditService;

    private static final Set<String> EXCLUDED_PREFIXES = Set.of(
            "/api/auth", "/swagger-ui", "/v3/api-docs"
    );

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        filterChain.doFilter(request, response);

        String uri = request.getRequestURI();
        if (EXCLUDED_PREFIXES.stream().anyMatch(uri::startsWith)) {
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String login = (auth != null && auth.isAuthenticated()) ? auth.getName() : "anonyme";

        auditService.log(AuditAction.ACCES_API, login, null, request, response.getStatus(), null);
    }
}
