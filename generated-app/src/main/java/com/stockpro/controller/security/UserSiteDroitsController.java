package com.stockpro.controller.security;

import com.stockpro.dto.security.UserSiteDroitsDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.UserSiteDroitsService;
import com.stockpro.util.ExcelExporter;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/user-site-droits")
@RequiredArgsConstructor
@Tag(name = "User Site Droits", description = "Gestion des user site droits")
public class UserSiteDroitsController {

private final UserSiteDroitsService userSiteDroitsService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE_DROITS', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<UserSiteDroitsDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<UserSiteDroitsDTO> page = userSiteDroitsService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE_DROITS',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<UserSiteDroitsDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(userSiteDroitsService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE_DROITS',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<UserSiteDroitsDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(userSiteDroitsService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE_DROITS',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<UserSiteDroitsDTO> create(@Valid @RequestBody UserSiteDroitsDTO
                                            dto) {
                                            UserSiteDroitsDTO created = userSiteDroitsService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE_DROITS',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<UserSiteDroitsDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                UserSiteDroitsDTO dto) {
                                                return ResponseEntity.ok(userSiteDroitsService.update(id, dto));
                                                }

                                                    }