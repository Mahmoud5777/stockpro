package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ProfilDroitDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.ProfilDroitService;
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
@RequestMapping("/api/profil-droits")
@RequiredArgsConstructor
@Tag(name = "ProfilDroits", description = "Droits d'accès aux fonctionnalités pour un profil")
public class ProfilDroitController {

    private final ProfilDroitService profilDroitService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ProfilDroitDTO>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProfilDroitDTO> page = profilDroitService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ProfilDroitDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(profilDroitService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'CONSULTATION')")
    @GetMapping("/profil/{idProfil}")
    public ResponseEntity<List<ProfilDroitDTO>> getByProfil(@PathVariable UUID idProfil) {
        return ResponseEntity.ok(profilDroitService.findByProfil(idProfil));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<ProfilDroitDTO> create(@Valid @RequestBody ProfilDroitDTO dto) {
        ProfilDroitDTO created = profilDroitService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ProfilDroitDTO> update(@PathVariable UUID id, @Valid @RequestBody ProfilDroitDTO dto) {
        return ResponseEntity.ok(profilDroitService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PROFILS', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        profilDroitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
