package com.stockpro.controller.security;

import com.stockpro.dto.security.SiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.SiteService;
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
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SiteDTO> page = siteService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }

                @Operation(summary = "Exporter les sites (recherche + filtres) en Excel (.xlsx)")
                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES', 'EXPORT')")
                @GetMapping("/export")
                public ResponseEntity<byte[]> export(
                    @RequestParam(required = false) String search,
                    @RequestParam Map<String, String> filters) {
                        List<SiteDTO> items = siteService.findAllForExport(search, filters);
                            List<Object[]> rows = items.stream()
                                .map(i -> new Object[]{ i.getNom(), i.getCode(), i.getDescription() })
                                .toList();
                                return ExcelExporter.asResponse("sites.xlsx", "Sites",
                                new String[]{ "Nom",
                                "Code",
                                "Description" }, rows);
                                }

                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<SiteDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(siteService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<SiteDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(siteService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<SiteDTO> create(@Valid @RequestBody SiteDTO
                                            dto) {
                                            SiteDTO created = siteService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SITES',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<SiteDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                SiteDTO dto) {
                                                return ResponseEntity.ok(siteService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_SITES', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    siteService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }