package com.stockpro.controller.administration;

import com.stockpro.dto.administration.RoleDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Role;
import com.stockpro.mapper.administration.RoleMapper;
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
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Rôles", description = "Gestion des rôles")
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<RoleDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<RoleDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<RoleDTO>> getAllUnpaged() {
        List<RoleDTO> result = roleService.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(roleService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<RoleDTO> create(@Valid @RequestBody RoleDTO dto) {
        Role created = roleService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> update(@PathVariable UUID id, @Valid @RequestBody RoleDTO dto) {
        Role updated = roleService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ROLES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
