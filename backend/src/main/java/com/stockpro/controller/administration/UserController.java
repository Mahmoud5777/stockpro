package com.stockpro.controller.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.User;
import com.stockpro.mapper.administration.UserMapper;
import com.stockpro.service.administration.UserService;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs")
public class UserController {

    private final UserService userService;
    private final UserMapper mapper;

    // ═══ UN SEUL ENDPOINT : liste + recherche + filtres ═══
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<UserDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean etatCompte,
            @RequestParam(required = false) UUID siteId,
            @PageableDefault(size = 20, sort = "nomComplet") Pageable pageable) {

        Page<UserDTO> page = userService.findAll(search, etatCompte, siteId, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    // ─── Transition : redirige l'ancien /search (à supprimer plus tard) ───
    @Deprecated
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<UserDTO>> searchLegacy(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomComplet") Pageable pageable) {
        return getAll(q, null, null, pageable);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok((userService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/login/{login}")
    public ResponseEntity<UserDTO> getByLogin(@PathVariable String login) {
        return ResponseEntity.ok((userService.findByLogin(login)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'AJOUT')")
    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO dto) {
        User created = mapper.toEntity(userService.create(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable UUID id, @Valid @RequestBody UserDTO dto) {
        User updated = mapper.toEntity(userService.update(id, dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}