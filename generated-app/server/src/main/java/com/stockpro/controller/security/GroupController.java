package com.stockpro.controller.security;

import com.stockpro.dto.security.GroupDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.security.GroupService;
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
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Groupes", description = "Gestion des groupes")
public class GroupController {

private final GroupService groupService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<GroupDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "nom") Pageable pageable) {
        Page<GroupDTO> page = groupService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }

                @Operation(summary = "Exporter les groupes (recherche + filtres) en Excel (.xlsx)")
                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS', 'EXPORT')")
                @GetMapping("/export")
                public ResponseEntity<byte[]> export(
                    @RequestParam(required = false) String search,
                    @RequestParam Map<String, String> filters) {
                        List<GroupDTO> items = groupService.findAllForExport(search, filters);
                            List<Object[]> rows = items.stream()
                                .map(i -> new Object[]{ i.getNom(), i.getCode(), i.getDescription() })
                                .toList();
                                return ExcelExporter.asResponse("groups.xlsx", "Groupes",
                                new String[]{ "Nom",
                                "Code",
                                "Description" }, rows);
                                }

                                @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS',
                                'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<GroupDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(groupService.findAll());
                                    }

                                    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS',
                                    'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<GroupDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(groupService.findById(id));
                                        }

                                        @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS',
                                        'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<GroupDTO> create(@Valid @RequestBody GroupDTO
                                            dto) {
                                            GroupDTO created = groupService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

                                            @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_GROUPS',
                                            'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<GroupDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                GroupDTO dto) {
                                                return ResponseEntity.ok(groupService.update(id, dto));
                                                }

                                                @PreAuthorize("@accessGuard.can(authentication,
                                                'ADMIN_GROUPS', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    groupService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }