package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Gestion des applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @Operation(summary = "Lister les applications (paginé)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<ApplicationDTO>> getAllUnpaged() {
        return ResponseEntity.ok(applicationService.findAll());
    }

    @Operation(summary = "Rechercher une application par nom ou code")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.search(q, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(applicationService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@Valid @RequestBody ApplicationDTO dto) {
        ApplicationDTO created = applicationService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(@PathVariable UUID id, @Valid @RequestBody ApplicationDTO dto) {
        ApplicationDTO updated = applicationService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
