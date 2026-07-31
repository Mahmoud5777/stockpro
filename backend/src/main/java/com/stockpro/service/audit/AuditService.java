package com.stockpro.service.audit;

import com.stockpro.entity.audit.AuditAction;
import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

public interface AuditService {

    /**
     * Enregistre une entrée d'audit. Ne doit jamais lever d'exception qui casserait
     * le flux principal (la persistance de l'audit ne doit jamais faire échouer une requête).
     */
    void log(AuditAction action, String login, UUID idUtil, HttpServletRequest request,
             Integer statutHttp, String details);
}
