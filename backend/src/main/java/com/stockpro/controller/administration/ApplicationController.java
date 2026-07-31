package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.mapper.administration.ApplicationMapper;
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
    private final ApplicationMapper mapper;

    @Operation(summary = "Lister les applications (paginé)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<ApplicationDTO>> getAllUnpaged() {
        List<ApplicationDTO> result = applicationService.findAll().stream().map(mapper::toDto).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Rechercher une application par nom ou code")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(applicationService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@Valid @RequestBody ApplicationDTO dto) {
        Application created = applicationService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(@PathVariable UUID id, @Valid @RequestBody ApplicationDTO dto) {
        Application updated = applicationService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
