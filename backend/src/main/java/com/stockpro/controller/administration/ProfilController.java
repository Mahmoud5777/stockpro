package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ProfilDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Profil;
import com.stockpro.mapper.administration.ProfilMapper;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profils")
@RequiredArgsConstructor
@Tag(name = "Profils", description = "Gestion des profils")
public class ProfilController {

    private final ProfilService profilService;
    private final ProfilMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ProfilDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ProfilDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Liste complète non paginée (pour les selects/multi-selects)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<ProfilDTO>> getAllUnpaged() {
        List<ProfilDTO> result = profilService.findAll().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ProfilDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(profilService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'AJOUT')")
    @PostMapping
    public ResponseEntity<ProfilDTO> create(@Valid @RequestBody ProfilDTO dto) {
        Profil created = profilService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfilDTO> update(@PathVariable String id, @Valid @RequestBody ProfilDTO dto) {
        Profil updated = profilService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        profilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
