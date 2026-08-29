package com.stockpro.controller.s;

import com.stockpro.dto.s.SDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.s.SService;
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
@RequestMapping("/api/ss")
@RequiredArgsConstructor
@Tag(name = "Ss", description = "Gestion des ss")
public class SController {

private final SService sService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_S', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<SDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SDTO> page = sService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_S',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<SDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(sService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_S',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<SDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(sService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_S',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<SDTO> create(@RequestBody SDTO
                                            dto) {
                                            SDTO created = sService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_S',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<SDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                SDTO dto) {
                                                return ResponseEntity.ok(sService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_S', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    sService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }