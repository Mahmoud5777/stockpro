package com.stockpro.controller.stock;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.stock.ProductDTO;
import com.stockpro.service.stock.ProductService;
import com.stockpro.util.ExcelExporter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
@Tag(name = "Produits", description = "Gestion des produits")
public class ProductController {

    private final ProductService productService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ProductDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 20, sort = "nom") Pageable pageable) {
        Page<ProductDTO> page = productService.findAll(search, filters, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Exporter les produits (recherche + filtres) en Excel (.xlsx)")
    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'EXPORT')")
    @GetMapping("/export")
    public ResponseEntity<byte[]> export(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters) {
        List<ProductDTO> items = productService.findAllForExport(search, filters);
        List<Object[]> rows = items.stream()
                .map(i -> new Object[] { i.getName(), i.getPrice() })
                .toList();
        return ExcelExporter.asResponse("produits.xlsx", "Produits",
                new String[] { "Nom", "Prix" }, rows);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<ProductDTO>> getAllUnpaged() {
        return ResponseEntity.ok(productService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'AJOUT')")
    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO dto) {
        ProductDTO created = productService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable UUID id, @Valid @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(productService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_PRODUITS', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}