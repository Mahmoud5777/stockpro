package com.stockpro.controller.security;

import com.stockpro.dto.security.UserSiteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.UserSiteService;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/user-sites")
@RequiredArgsConstructor
@Tag(name = "User Sites", description = "Gestion des user sites")
public class UserSiteController {

private final UserSiteService userSiteService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<UserSiteDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<UserSiteDTO> page = userSiteService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<UserSiteDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(userSiteService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<UserSiteDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(userSiteService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<UserSiteDTO> create(@RequestBody UserSiteDTO
                                            dto) {
                                            UserSiteDTO created = userSiteService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER_SITE',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<UserSiteDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                UserSiteDTO dto) {
                                                return ResponseEntity.ok(userSiteService.update(id, dto));
                                                }

                                                    }