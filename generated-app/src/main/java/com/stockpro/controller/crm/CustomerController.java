package com.stockpro.controller.crm;

import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.dto.crm.CustomerDTO;
import com.stockpro.service.crm.CustomerService;
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
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Clients", description = "Gestion des clients")
public class CustomerController {

    private final CustomerService customerService;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<CustomerDTO>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam Map<String, String> filters,
            @PageableDefault(size = 20, sort = "nom") Pageable pageable) {
        Page<CustomerDTO> page = customerService.findAll(search, filters, pageable);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<CustomerDTO>> getAllUnpaged() {
        return ResponseEntity.ok(customerService.findAll());
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.findById(id));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'AJOUT')")
    @PostMapping
    public ResponseEntity<CustomerDTO> create(@Valid @RequestBody CustomerDTO dto) {
        CustomerDTO created = customerService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> update(@PathVariable UUID id, @Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.update(id, dto));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CLIENTS', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}