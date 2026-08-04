package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ProfilDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.ProfilService;
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
@RequestMapping("/api/profils")
@RequiredArgsConstructor
@Tag(name = "Profils", description = "Gestion des profils")
public class ProfilController {

    private final ProfilService profilService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ProfilDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ProfilDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.search(q, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<ProfilDTO>> getAllUnpaged() {
        return ResponseEntity.ok(profilService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ProfilDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(profilService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'AJOUT')")
    @PostMapping
    public ResponseEntity<ProfilDTO> create(@Valid @RequestBody ProfilDTO dto) {
        ProfilDTO created = profilService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfilDTO> update(@PathVariable UUID id, @Valid @RequestBody ProfilDTO dto) {
        return ResponseEntity.ok(profilService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        profilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}