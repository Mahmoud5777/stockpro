package com.stockpro.controller.administration;

import com.stockpro.dto.administration.SzDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.SzService;
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
@RequestMapping("/api/szs")
@RequiredArgsConstructor
@Tag(name = "Szs", description = "Gestion des szs")
public class SzController {

private final SzService szService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SZ', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<SzDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SzDTO> page = szService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SZ',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<SzDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(szService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SZ',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<SzDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(szService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SZ',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<SzDTO> create(@RequestBody SzDTO
                                            dto) {
                                            SzDTO created = szService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SZ',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<SzDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                SzDTO dto) {
                                                return ResponseEntity.ok(szService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_SZ', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    szService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }