package com.stockpro.controller.security;

import com.stockpro.dto.security.UserDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs")
public class UserController {

private final UserService userService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<UserDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<UserDTO> page = userService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }

                @Operation(summary = "Exporter les utilisateurs (recherche + filtres) en Excel (.xlsx)")
                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS', 'EXPORT')")
                @GetMapping("/export")
                public ResponseEntity<byte[]> export(
                    @RequestParam(required = false) String search,
                    @RequestParam Map<String, String> filters) {
                        List<UserDTO> items = userService.findAllForExport(search, filters);
                            List<Object[]> rows = items.stream()
                                .map(i -> new Object[]{ i.getUsername(), i.getEmail(), i.getPrenom(), i.getNom(), i.getEstActif() })
                                .toList();
                                return ExcelExporter.asResponse("users.xlsx", "Utilisateurs",
                                new String[]{ "Username",
                                "Email",
                                "Prénom",
                                "Nom",
                                "Actif" }, rows);
                                }

                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<UserDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(userService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(userService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO
                                            dto) {
                                            UserDTO created = userService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USERS',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<UserDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                UserDTO dto) {
                                                return ResponseEntity.ok(userService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_USERS', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    userService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }