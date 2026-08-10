package com.stockpro.controller.administration;

import com.stockpro.dto.administration.RoleDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.RoleService;
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
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Rôles", description = "Gestion des rôles")
public class RoleController {

    private final RoleService roleService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<RoleDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.findAll(search, filters, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<RoleDTO>> getAllUnpaged() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(roleService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<RoleDTO> create(@Valid @RequestBody RoleDTO dto) {
        RoleDTO created = roleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> update(@PathVariable UUID id, @Valid @RequestBody RoleDTO dto) {
        return ResponseEntity.ok(roleService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}