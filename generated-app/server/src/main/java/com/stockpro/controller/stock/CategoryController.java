package com.stockpro.controller.stock;

import com.stockpro.dto.stock.CategoryDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.stock.CategoryService;
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
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(name = "Categorys", description = "Gestion des categorys")
public class CategoryController {

private final CategoryService categoryService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CATEGORY', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<CategoryDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<CategoryDTO> page = categoryService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CATEGORY', 'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<CategoryDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(categoryService.findAll());
                                    }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CATEGORY', 'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<CategoryDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(categoryService.findById(id));
                                        }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CATEGORY', 'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<CategoryDTO> create(@Valid @RequestBody CategoryDTO
                                            dto) {
                                            CategoryDTO created = categoryService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CATEGORY', 'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<CategoryDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                CategoryDTO dto) {
                                                return ResponseEntity.ok(categoryService.update(id, dto));
                                                }

                                                    }
