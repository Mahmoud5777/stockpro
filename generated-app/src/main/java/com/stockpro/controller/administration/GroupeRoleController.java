package com.stockpro.controller.administration;

import com.stockpro.dto.administration.GroupeRoleDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.GroupeRoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groupe-roles")
@RequiredArgsConstructor
@Tag(name = "GroupeRoles", description = "Affectation des roles aux groupes")
public class GroupeRoleController {

    private final GroupeRoleService groupeRoleService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeRoleDTO>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<GroupeRoleDTO> page = groupeRoleService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<GroupeRoleDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupeRoleService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/groupe/{idGroupe}")
    public ResponseEntity<List<GroupeRoleDTO>> getByGroupe(@PathVariable UUID idGroupe) {
        return ResponseEntity.ok(groupeRoleService.findByGroupe(idGroupe));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<GroupeRoleDTO> create(@Valid @RequestBody GroupeRoleDTO dto) {
        GroupeRoleDTO created = groupeRoleService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupeRoleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
