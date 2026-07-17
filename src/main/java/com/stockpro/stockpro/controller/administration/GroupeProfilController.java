package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.GroupeProfilDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.GroupeProfil;
import com.stockpro.stockpro.mapper.administration.GroupeProfilMapper;
import com.stockpro.stockpro.service.administration.GroupeProfilService;
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
@RequestMapping("/api/groupe-profils")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Groupe-Profil", description = "Association groupes / profils")
public class GroupeProfilController {

    private final GroupeProfilService groupeProfilService;
    private final GroupeProfilMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<GroupeProfilDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<GroupeProfilDTO> page = groupeProfilService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(groupeProfilService.findById(id)));
    }

    @GetMapping("/groupe/{idGr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByGroupe(@PathVariable String idGr) {
        List<GroupeProfilDTO> result = groupeProfilService.findByGroupe(idGr).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/profil/{idPr}")
    public ResponseEntity<List<GroupeProfilDTO>> getByProfil(@PathVariable String idPr) {
        List<GroupeProfilDTO> result = groupeProfilService.findByProfil(idPr).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<GroupeProfilDTO> create(@Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfil created = groupeProfilService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupeProfilDTO> update(@PathVariable String id, @Valid @RequestBody GroupeProfilDTO dto) {
        GroupeProfil updated = groupeProfilService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        groupeProfilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
