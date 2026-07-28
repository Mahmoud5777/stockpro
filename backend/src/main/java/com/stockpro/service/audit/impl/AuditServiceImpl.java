package com.stockpro.service.audit.impl;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.entity.audit.LogAcces;
import com.stockpro.repository.audit.LogAccesRepository;
import com.stockpro.service.audit.AuditService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private final LogAccesRepository logAccesRepository;

    // REQUIRES_NEW : l'audit doit être persisté même si la transaction "métier"
    // englobante échoue (ex: on veut garder la trace d'un login raté).
    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(AuditAction action, String login, String idUtil, HttpServletRequest request,
                     Integer statutHttp, String details) {
        try {
            LogAcces entry = LogAcces.builder()
                    .action(action)
                    .login(login)
                    .idUtil(idUtil)
                    .methodeHttp(request != null ? request.getMethod() : null)
                    .endpoint(request != null ? request.getRequestURI() : null)
                    .statutHttp(statutHttp)
                    .adresseIp(request != null ? extractIp(request) : null)
                    .userAgent(request != null ? truncate(request.getHeader("User-Agent"), 255) : null)
                    .details(details)
                    .build();
            logAccesRepository.save(entry);
        } catch (Exception e) {
            // L'audit ne doit jamais faire échouer la requête principale
            log.warn("Échec de l'enregistrement du log d'audit ({}): {}", action, e.getMessage());
        }
    }

    private String extractIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String truncate(String value, int maxLength) {
        if (value == null) return null;
        return value.length() > maxLength ? value.substring(0, maxLength) : value;
    }
}
