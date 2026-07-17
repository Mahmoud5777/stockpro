package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.GroupeRoleDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.GroupeRole;
import com.stockpro.stockpro.mapper.administration.GroupeRoleMapper;
import com.stockpro.stockpro.service.administration.GroupeRoleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groupe-roles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Groupe-Rôle", description = "Association groupes / rôles")
public class GroupeRoleController {

    private final GroupeRoleService groupeRoleService;
    private final GroupeRoleMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeRoleDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<GroupeRoleDTO> page = groupeRoleService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupeRoleDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(groupeRoleService.findById(id)));
    }

    @GetMapping("/groupe/{idGr}")
    public ResponseEntity<List<GroupeRoleDTO>> getByGroupe(@PathVariable String idGr) {
        List<GroupeRoleDTO> result = groupeRoleService.findByGroupe(idGr).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/role/{idRl}")
    public ResponseEntity<List<GroupeRoleDTO>> getByRole(@PathVariable String idRl) {
        List<GroupeRoleDTO> result = groupeRoleService.findByRole(idRl).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<GroupeRoleDTO> create(@Valid @RequestBody GroupeRoleDTO dto) {
        GroupeRole created = groupeRoleService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupeRoleDTO> update(@PathVariable String id, @Valid @RequestBody GroupeRoleDTO dto) {
        GroupeRole updated = groupeRoleService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        groupeRoleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
