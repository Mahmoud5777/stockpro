package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ErzrDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.ErzrService;
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
@RequestMapping("/api/erzrs")
@RequiredArgsConstructor
@Tag(name = "Erzrs", description = "Gestion des erzrs")
public class ErzrController {

private final ErzrService erzrService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ERZR', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<ErzrDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<ErzrDTO> page = erzrService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ERZR',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<ErzrDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(erzrService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ERZR',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<ErzrDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(erzrService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ERZR',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<ErzrDTO> create(@RequestBody ErzrDTO
                                            dto) {
                                            ErzrDTO created = erzrService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ERZR',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<ErzrDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                ErzrDTO dto) {
                                                return ResponseEntity.ok(erzrService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_ERZR', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    erzrService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }