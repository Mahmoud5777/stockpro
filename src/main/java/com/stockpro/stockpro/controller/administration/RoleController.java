package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.RoleDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Role;
import com.stockpro.stockpro.mapper.administration.RoleMapper;
import com.stockpro.stockpro.service.administration.RoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Rôles", description = "Gestion des rôles")
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<RoleDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<RoleDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<RoleDTO> page = roleService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(roleService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<RoleDTO> create(@Valid @RequestBody RoleDTO dto) {
        Role created = roleService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleDTO> update(@PathVariable String id, @Valid @RequestBody RoleDTO dto) {
        Role updated = roleService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
