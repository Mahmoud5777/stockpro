package com.stockpro.controller.crm;

import com.stockpro.dto.crm.CustomerDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.service.crm.CustomerService;
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
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Gestion des customers")
public class CustomerController {

private final CustomerService customerService;

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CUSTOMER', 'CONSULTATION')")
@GetMapping
public ResponseEntity<PageResponseDTO<CustomerDTO>> getAll(
    @RequestParam(required = false) String search,
    @RequestParam Map<String, String> filters,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        Page<CustomerDTO> page = customerService.findAll(search, filters, pageable);
            return ResponseEntity.ok(PageResponseDTO.of(page));
            }


@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CUSTOMER', 'CONSULTATION')")
                                @GetMapping("/all")
                                public ResponseEntity<List<CustomerDTO>> getAllUnpaged() {
                                    return ResponseEntity.ok(customerService.findAll());
                                    }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CUSTOMER', 'CONSULTATION')")
                                    @GetMapping("/{id}")
                                    public ResponseEntity<CustomerDTO> getById(@PathVariable UUID id) {
                                        return ResponseEntity.ok(customerService.findById(id));
                                        }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CUSTOMER', 'AJOUT')")
                                        @PostMapping
                                        public ResponseEntity<CustomerDTO> create(@Valid @RequestBody CustomerDTO
                                            dto) {
                                            CustomerDTO created = customerService.create(dto);
                                            return ResponseEntity.status(HttpStatus.CREATED).body(created);
                                            }

@PreAuthorize("@accessGuard.can(authentication, 'ADMIN_CUSTOMER', 'MODIFICATION')")
                                            @PutMapping("/{id}")
                                            public ResponseEntity<CustomerDTO> update(@PathVariable UUID id,
                                                @Valid @RequestBody
                                                CustomerDTO dto) {
                                                return ResponseEntity.ok(customerService.update(id, dto));
                                                }

                                                    }
