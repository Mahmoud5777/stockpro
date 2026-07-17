package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.ProfilDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Profil;
import com.stockpro.stockpro.mapper.administration.ProfilMapper;
import com.stockpro.stockpro.service.administration.ProfilService;
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
@RequestMapping("/api/profils")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Profils", description = "Gestion des profils")
public class ProfilController {

    private final ProfilService profilService;
    private final ProfilMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<ProfilDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ProfilDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<ProfilDTO> page = profilService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfilDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(profilService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ProfilDTO> create(@Valid @RequestBody ProfilDTO dto) {
        Profil created = profilService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfilDTO> update(@PathVariable String id, @Valid @RequestBody ProfilDTO dto) {
        Profil updated = profilService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        profilService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
