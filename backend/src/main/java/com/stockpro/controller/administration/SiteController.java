package com.stockpro.controller.administration;

import com.stockpro.dto.administration.SiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.mapper.administration.SiteMapper;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@Tag(name = "Sites", description = "Gestion des sites")
public class SiteController {

    private final SiteService siteService;
    private final SiteMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<SiteDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<SiteDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<SiteDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(siteService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/racines")
    public ResponseEntity<List<SiteDTO>> getRacines() {
        List<SiteDTO> result = siteService.findRacines().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<SiteDTO>> getAllUnpaged() {
        List<SiteDTO> result = siteService.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'CONSULTATION')")
    @GetMapping("/{id}/enfants")
    public ResponseEntity<List<SiteDTO>> getEnfants(@PathVariable UUID id) {
        List<SiteDTO> result = siteService.findEnfants(id).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<SiteDTO> create(@Valid @RequestBody SiteDTO dto) {
        Site created = siteService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> update(@PathVariable UUID id, @Valid @RequestBody SiteDTO dto) {
        Site updated = siteService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
