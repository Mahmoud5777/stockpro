package com.stockpro.controller.administration;

import com.stockpro.dto.administration.UserSiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.UserSite;
import com.stockpro.mapper.administration.UserSiteMapper;
import com.stockpro.service.administration.UserSiteService;
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
@RequestMapping("/api/user-sites")
@RequiredArgsConstructor
@Tag(name = "Affectations Utilisateur-Site", description = "Rattachement des utilisateurs aux sites")
public class UserSiteController {

    private final UserSiteService userSiteService;
    private final UserSiteMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<UserSiteDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserSiteDTO> page = userSiteService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<UserSiteDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(userSiteService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/user/{idUtil}")
    public ResponseEntity<List<UserSiteDTO>> getByUser(@PathVariable String idUtil) {
        List<UserSiteDTO> result = userSiteService.findByUser(idUtil).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'CONSULTATION')")
    @GetMapping("/site/{idSite}")
    public ResponseEntity<List<UserSiteDTO>> getBySite(@PathVariable String idSite) {
        List<UserSiteDTO> result = userSiteService.findBySite(idSite).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PostMapping
    public ResponseEntity<UserSiteDTO> create(@Valid @RequestBody UserSiteDTO dto) {
        UserSite created = userSiteService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<UserSiteDTO> update(@PathVariable String id, @Valid @RequestBody UserSiteDTO dto) {
        UserSite updated = userSiteService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_UTILISATEURS', 'MODIFICATION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userSiteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
