package com.stockpro.controller.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Gestion des users")
public class UserController {

private final UserService userService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<UserDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<UserDTO> page = userService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<UserDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(userService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(userService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<UserDTO> create(@RequestBody UserDTO
                                            dto) {
                                            UserDTO created = userService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_USER',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<UserDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                UserDTO dto) {
                                                return ResponseEntity.ok(userService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_USER', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    userService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }