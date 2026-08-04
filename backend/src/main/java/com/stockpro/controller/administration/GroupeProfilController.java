package com.stockpro.controller.administration;

import com.stockpro.dto.administration.GroupeProfilDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.GroupeProfilService;
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
@RequestMapping("/api/groupe-profils")
@RequiredArgsConstructor
@Tag(name = "Groupe-Profil", description = "Association groupes / profils")
public class GroupeProfilController {

    private final GroupeProfilService groupeProfilService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeProfilDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<GroupeProfilDTO> page = groupeProfilService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupeProfilService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/groupe/{idGr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByGroupe(@PathVariable UUID idGr) {
        return ResponseEntity.ok(groupeProfilService.findByGroupe(idGr));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/profil/{idPr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByProfil(@PathVariable UUID idPr) {
        return ResponseEntity.ok(groupeProfilService.findByProfil(idPr));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<GroupeProfilDTO> create(@Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfilDTO created = groupeProfilService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> update(@PathVariable UUID id, @Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfilDTO updated = groupeProfilService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        groupeProfilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
