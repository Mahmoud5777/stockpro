package com.stockpro.controller.administration;

import com.stockpro.dto.administration.GroupeDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.mapper.administration.GroupeMapper;
import com.stockpro.service.administration.GroupeService;
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
@RequestMapping("/api/groupes")
@RequiredArgsConstructor
@Tag(name = "Groupes", description = "Gestion des groupes")
public class GroupeController {

    private final GroupeService groupeService;
    private final GroupeMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<GroupeDTO> page = groupeService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<GroupeDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<GroupeDTO> page = groupeService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<GroupeDTO>> getAllUnpaged() {
        List<GroupeDTO> result = groupeService.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<GroupeDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(mapper.toDto(groupeService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<GroupeDTO> create(@Valid @RequestBody GroupeDTO dto) {
        Groupe created = groupeService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<GroupeDTO> update(@PathVariable UUID id, @Valid @RequestBody GroupeDTO dto) {
        Groupe updated = groupeService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}