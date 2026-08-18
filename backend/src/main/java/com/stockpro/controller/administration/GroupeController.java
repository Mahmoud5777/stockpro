package com.stockpro.controller.administration;

import com.stockpro.dto.administration.GroupeDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.GroupeService;
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
@RequestMapping("/api/groupes")
@RequiredArgsConstructor
@Tag(name = "Groupes", description = "Gestion des groupes")
public class GroupeController {

    private final GroupeService groupeService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<GroupeDTO> page = groupeService.findAll(search, filters, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Exporter les groupes (recherche + filtres) en Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters) {
        List<GroupeDTO> groupes = groupeService.findAllForExport(search, filters);
        List<Object[]> rows = groupes.stream()
                .map(g -> new Object[]{g.getCodeGroupe(), g.getLibelle(), g.getDescription()})
                .toList();
        return ExcelExporter.asResponse("groupes.xlsx", "Groupes",
                new String[]{"Code", "Libellé", "Description"}, rows);
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<GroupeDTO>> getAllUnpaged() {
        return ResponseEntity.ok(groupeService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<GroupeDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupeService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<GroupeDTO> create(@Valid @RequestBody GroupeDTO dto) {
        GroupeDTO created = groupeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<GroupeDTO> update(@PathVariable UUID id, @Valid @RequestBody GroupeDTO dto) {
        GroupeDTO updated = groupeService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
