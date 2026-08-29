package com.stockpro.controller.security;

import com.stockpro.dto.security.GroupeRoleDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.GroupeRoleService;
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
@RequestMapping("/api/group-roles")
@RequiredArgsConstructor
@Tag(name = "Group Roles", description = "Gestion des group roles")
public class GroupeRoleController {

private final GroupeRoleService groupRoleService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUP_ROLE', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<GroupeRoleDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<GroupeRoleDTO> page = groupRoleService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUP_ROLE',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<GroupeRoleDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(groupRoleService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUP_ROLE',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<GroupeRoleDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(groupRoleService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUP_ROLE',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<GroupeRoleDTO> create(@RequestBody GroupeRoleDTO
                                            dto) {
                                            GroupeRoleDTO created = groupRoleService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUP_ROLE',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<GroupeRoleDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                GroupeRoleDTO dto) {
                                                return ResponseEntity.ok(groupRoleService.update(id, dto));
                                                }

                                                    }