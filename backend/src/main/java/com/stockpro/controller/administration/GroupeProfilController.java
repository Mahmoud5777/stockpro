package com.stockpro.controller.administration;

import com.stockpro.dto.administration.GroupeProfilDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.GroupeProfil;
import com.stockpro.mapper.administration.GroupeProfilMapper;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupe-profils")
@RequiredArgsConstructor
@Tag(name = "Groupe-Profil", description = "Association groupes / profils")
public class GroupeProfilController {

    private final GroupeProfilService groupeProfilService;
    private final GroupeProfilMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeProfilDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<GroupeProfilDTO> page = groupeProfilService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(groupeProfilService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/groupe/{idGr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByGroupe(@PathVariable String idGr) {
        List<GroupeProfilDTO> result = groupeProfilService.findByGroupe(idGr).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'CONSULTATION')")
    @GetMapping("/profil/{idPr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByProfil(@PathVariable String idPr) {
        List<GroupeProfilDTO> result = groupeProfilService.findByProfil(idPr).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<GroupeProfilDTO> create(@Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfil created = groupeProfilService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> update(@PathVariable String id, @Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfil updated = groupeProfilService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPES', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        groupeProfilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
