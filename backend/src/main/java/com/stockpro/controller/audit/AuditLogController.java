package com.stockpro.controller.audit;

import com.stockpro.dto.audit.LogAccesDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.mapper.audit.LogAccesMapper;
import com.stockpro.service.audit.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
