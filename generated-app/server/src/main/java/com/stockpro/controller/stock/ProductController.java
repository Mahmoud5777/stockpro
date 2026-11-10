package com.stockpro.controller.stock;

import com.stockpro.dto.stock.ProductDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.stock.ProductService;
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
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Gestion des products")
public class ProductController {

private final ProductService productService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<ProductDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<ProductDTO> page = productService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }

                @Operation(summary = "Exporter les products (recherche + filtres) en Excel (.xlsx)")
@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'EXPORT')")
                @GetMapping("/export")
                public ResponseEntity<byte[]> export(
                    @RequestParam(required = false) String search,
                    @RequestParam Map<String, String> filters) {
                        List<ProductDTO> items = productService.findAllForExport(search, filters);
                            List<Object[]> rows = items.stream()
                                .map(i -> new Object[]{ i.getName(), i.getPrice() })
                                .toList();
                                return ExcelExporter.asResponse("produits.xlsx", "Products",
                                new String[]{ "Nom",
                                "Prix" }, rows);
                                }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<ProductDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(productService.findAll());
                                    }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<ProductDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(productService.findById(id));
                                        }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO
                                            dto) {
                                            ProductDTO created = productService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<ProductDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                ProductDTO dto) {
                                                return ResponseEntity.ok(productService.update(id, dto));
                                                }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUCT', 'SUPPRESSION')")
                                                @DeleteMapping("/{id}")
                                                public ResponseEntity<Void> delete(@PathVariable UUID id) {
                                                    productService.delete(id);
                                                    return ResponseEntity.noContent().build();
                                                    }
                                                    }
