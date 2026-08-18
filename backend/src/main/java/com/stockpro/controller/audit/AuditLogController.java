package com.stockpro.controller.audit;

import com.stockpro.dto.audit.LogAccesDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.audit.AuditAction;
import com.stockpro.mapper.audit.LogAccesMapper;
import com.stockpro.service.audit.AuditLogService;
import com.stockpro.util.ExcelExporter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Consultation des logs d'audit ("Logs" dans la matrice de droits du module Administration).
 * Protégé par le droit CONSULTATION sur la fonctionnalité ADMIN_AUDIT (voir AccessGuard).
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit / Logs", description = "Consultation des logs d'accès et d'authentification")
public class AuditLogController {

    private static final Map<AuditAction, String> ACTION_LABELS = Map.of(
            AuditAction.LOGIN_SUCCESS, "Connexion réussie",
            AuditAction.LOGIN_FAILURE, "Échec de connexion",
            AuditAction.LOGOUT, "Déconnexion",
            AuditAction.REFRESH_TOKEN, "Rafraîchissement token",
            AuditAction.ACCES_API, "Appel API");

    private final AuditLogService auditLogService;
    private final LogAccesMapper mapper;

    @Operation(summary = "Lister les logs d'accès (paginé, filtrable par recherche et type d'action)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_AUDIT', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<LogAccesDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 50, sort = "dateAcces", direction = org.springframework.data.domain.Sort.Direction.DESC) Pageable pageable) {

        Page<LogAccesDTO> page = auditLogService.findAll(search, filters, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Exporter les logs d'accès (recherche + filtres) en Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_AUDIT', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters) {
        List<LogAccesDTO> logs = auditLogService.findAllForExport(search, filters).stream()
                .map(mapper::toDto)
                .toList();
        List<Object[]> rows = logs.stream()
                .map(l -> new Object[]{
                        l.getDateAcces(),
                        l.getLogin(),
                        ACTION_LABELS.getOrDefault(l.getAction(), l.getAction() != null ? l.getAction().name() : ""),
                        l.getMethodeHttp(),
                        l.getEndpoint(),
                        l.getStatutHttp(),
                        l.getAdresseIp()
                })
                .toList();
        return ExcelExporter.asResponse("audit-acces.xlsx", "Audit des accès",
                new String[]{"Date & heure", "Utilisateur", "Événement", "Méthode", "Endpoint", "Statut", "Adresse IP"}, rows);
    }
}