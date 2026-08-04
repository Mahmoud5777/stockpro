package com.stockpro.controller.administration;

import com.stockpro.dto.administration.SiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.SiteService;
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
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites", description = "Gestion des sites")
public class SiteController {

    private final SiteService siteService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<SiteDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<SiteDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.search(q, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<SiteDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(siteService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/racines")
    public ResponseEntity<List<SiteDTO>> getRacines() {
        return ResponseEntity.ok(siteService.findRacines());
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<SiteDTO>> getAllUnpaged() {
        return ResponseEntity.ok(siteService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/{id}/enfants")
    public ResponseEntity<List<SiteDTO>> getEnfants(@PathVariable UUID id) {
        return ResponseEntity.ok(siteService.findEnfants(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<SiteDTO> create(@Valid @RequestBody SiteDTO dto) {
        SiteDTO created = siteService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> update(@PathVariable UUID id, @Valid @RequestBody SiteDTO dto) {
        return ResponseEntity.ok(siteService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}