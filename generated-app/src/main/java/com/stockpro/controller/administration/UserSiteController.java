package com.stockpro.controller.administration;

import com.stockpro.dto.administration.UserSiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.UserSiteService;
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
@RequestMapping("/api/user-sites")
@RequiredArgsConstructor
@Tag(name = "UserSites", description = "Affectation des utilisateurs à des sites")
public class UserSiteController {

    private final UserSiteService userSiteService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<UserSiteDTO>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<UserSiteDTO> page = userSiteService.findAll(pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<UserSiteDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userSiteService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/user/{idUtil}")
    public ResponseEntity<List<UserSiteDTO>> getByUser(@PathVariable UUID idUtil) {
        return ResponseEntity.ok(userSiteService.findByUser(idUtil));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/site/{idSite}")
    public ResponseEntity<List<UserSiteDTO>> getBySite(@PathVariable UUID idSite) {
        return ResponseEntity.ok(userSiteService.findBySite(idSite));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<UserSiteDTO> create(@Valid @RequestBody UserSiteDTO dto) {
        UserSiteDTO created = userSiteService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<UserSiteDTO> update(@PathVariable UUID id, @Valid @RequestBody UserSiteDTO dto) {
        return ResponseEntity.ok(userSiteService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userSiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
