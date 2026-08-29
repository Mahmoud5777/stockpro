package com.stockpro.controller.administration;

import com.stockpro.dto.administration.SdDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.administration.SdService;
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
@RequestMapping("/api/sds")
@RequiredArgsConstructor
@Tag(name = "Sds", description = "Gestion des sds")
public class SdController {

private final SdService sdService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SD', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<SdDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<SdDTO> page = sdService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SD',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<SdDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(sdService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SD',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<SdDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(sdService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SD',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<SdDTO> create(@RequestBody SdDTO
                                            dto) {
                                            SdDTO created = sdService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_SD',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<SdDTO> update(@PathVariable UUID id,
                                                @RequestBody
                                                SdDTO dto) {
                                                return ResponseEntity.ok(sdService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_SD', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    sdService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }