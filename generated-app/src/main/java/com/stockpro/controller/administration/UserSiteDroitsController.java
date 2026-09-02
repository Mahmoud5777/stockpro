package com.stockpro.controller.administration;

import com.stockpro.dto.administration.UserSiteDroitsDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.UserSiteDroitsService;
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
@RequestMapping("/api/user-site-droits")
@RequiredArgsConstructor
@Tag(name = "UserSiteDroits", description = "Droits d'un utilisateur sur un site (profil/groupe/role)")
public class UserSiteDroitsController {

    private final UserSiteDroitsService userSiteDroitsService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<UserSiteDroitsDTO>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserSiteDroitsDTO> page = userSiteDroitsService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<UserSiteDroitsDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userSiteDroitsService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/user-site/{idUtilSite}")
    public ResponseEntity<List<UserSiteDroitsDTO>> getByUserSite(@PathVariable UUID idUtilSite) {
        return ResponseEntity.ok(userSiteDroitsService.findByUserSite(idUtilSite));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<UserSiteDroitsDTO> create(@Valid @RequestBody UserSiteDroitsDTO dto) {
        UserSiteDroitsDTO created = userSiteDroitsService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<UserSiteDroitsDTO> update(@PathVariable UUID id, @Valid @RequestBody UserSiteDroitsDTO dto) {
        return ResponseEntity.ok(userSiteDroitsService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userSiteDroitsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
