package com.stockpro.controller.administration;

import com.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.FonctionnaliteService;
import com.stockpro.util.ExcelExporter;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/fonctionnalites")
@RequiredArgsConstructor
@Tag(name = "Fonctionnalités", description = "Gestion des fonctionnalités applicatives")
public class FonctionnaliteController {

    private final FonctionnaliteService fonctionnaliteService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<FonctionnaliteDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<FonctionnaliteDTO> page = fonctionnaliteService.findAll(search, filters, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Exporter les fonctionnalités (recherche + filtres) en Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters) {
        List<FonctionnaliteDTO> fonctionnalites = fonctionnaliteService.findAllForExport(search, filters);
        List<Object[]> rows = fonctionnalites.stream()
                .map(f -> new Object[]{
                        f.getCodeFonc(),
                        f.getLibelle(),
                        f.getDescription(),
                        f.getUrl(),
                        f.getActif(),
                        f.getOrderAffichage()
                })
                .toList();
        return ExcelExporter.asResponse("fonctionnalites.xlsx", "Fonctionnalités",
                new String[]{"Code", "Libellé", "Description", "URL", "Actif", "Ordre"}, rows);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(fonctionnaliteService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<FonctionnaliteDTO>> getAllUnpaged() {
        return ResponseEntity.ok(fonctionnaliteService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/application/{idApp}")
    public ResponseEntity<List<FonctionnaliteDTO>> getByApplication(@PathVariable UUID idApp) {
        return ResponseEntity.ok(fonctionnaliteService.findByApplication(idApp));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/racines")
    public ResponseEntity<List<FonctionnaliteDTO>> getRacines() {
        return ResponseEntity.ok(fonctionnaliteService.findRacines());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<FonctionnaliteDTO> create(@Valid @RequestBody FonctionnaliteDTO dto) {
        FonctionnaliteDTO created = fonctionnaliteService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> update(@PathVariable UUID id, @Valid @RequestBody FonctionnaliteDTO dto) {
        FonctionnaliteDTO updated = fonctionnaliteService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        fonctionnaliteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
