package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.GroupeDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Groupe;
import com.stockpro.stockpro.mapper.administration.GroupeMapper;
import com.stockpro.stockpro.service.administration.GroupeService;
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
@RequestMapping("/api/groupes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Groupes", description = "Gestion des groupes")
public class GroupeController {

    private final GroupeService groupeService;
    private final GroupeMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<GroupeDTO> page = groupeService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<GroupeDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<GroupeDTO> page = groupeService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupeDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(groupeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<GroupeDTO> create(@Valid @RequestBody GroupeDTO dto) {
        Groupe created = groupeService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupeDTO> update(@PathVariable String id, @Valid @RequestBody GroupeDTO dto) {
        Groupe updated = groupeService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        groupeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
