package com.stockpro.controller.administration;

import com.stockpro.dto.administration.EzrefeDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.EzrefeService;
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
@RequestMapping("/api/ezrefes")
@RequiredArgsConstructor
@Tag(name = "Ezrefes", description = "Gestion des ezrefes")
public class EzrefeController {

private final EzrefeService ezrefeService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_EZREFE', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<EzrefeDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<EzrefeDTO> page = ezrefeService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_EZREFE',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<EzrefeDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(ezrefeService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_EZREFE',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<EzrefeDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(ezrefeService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_EZREFE',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<EzrefeDTO> create(@RequestBody EzrefeDTO
                                            dto) {
                                            EzrefeDTO created = ezrefeService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_EZREFE',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<EzrefeDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                EzrefeDTO dto) {
                                                return ResponseEntity.ok(ezrefeService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_EZREFE', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    ezrefeService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }