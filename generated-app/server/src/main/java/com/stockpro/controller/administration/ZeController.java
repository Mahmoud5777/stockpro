package com.stockpro.controller.administration;

import com.stockpro.dto.administration.ZeDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.ZeService;
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
@RequestMapping("/api/zes")
@RequiredArgsConstructor
@Tag(name = "Zes", description = "Gestion des zes")
public class ZeController {

private final ZeService zeService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ZE', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<ZeDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<ZeDTO> page = zeService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ZE',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<ZeDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(zeService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ZE',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<ZeDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(zeService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ZE',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<ZeDTO> create(@RequestBody ZeDTO
                                            dto) {
                                            ZeDTO created = zeService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_ZE',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<ZeDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                ZeDTO dto) {
                                                return ResponseEntity.ok(zeService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_ZE', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    zeService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }