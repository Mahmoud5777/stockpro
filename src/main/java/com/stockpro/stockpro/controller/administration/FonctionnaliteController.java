package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.stockpro.mapper.administration.FonctionnaliteMapper;
import com.stockpro.stockpro.service.administration.FonctionnaliteService;
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
@RequestMapping("/api/fonctionnalites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Fonctionnalités", description = "Gestion des fonctionnalités applicatives")
public class FonctionnaliteController {

    private final FonctionnaliteService fonctionnaliteService;
    private final FonctionnaliteMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<FonctionnaliteDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<FonctionnaliteDTO> page = fonctionnaliteService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<FonctionnaliteDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<FonctionnaliteDTO> page = fonctionnaliteService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(fonctionnaliteService.findById(id)));
    }

    @GetMapping("/application/{idApp}")
    public ResponseEntity<List<FonctionnaliteDTO>> getByApplication(@PathVariable String idApp) {
        List<FonctionnaliteDTO> result = fonctionnaliteService.findByApplication(idApp)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/racines")
    public ResponseEntity<List<FonctionnaliteDTO>> getRacines() {
        List<FonctionnaliteDTO> result = fonctionnaliteService.findRacines()
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<FonctionnaliteDTO> create(@Valid @RequestBody FonctionnaliteDTO dto) {
        Fonctionnalite created = fonctionnaliteService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> update(@PathVariable String id, @Valid @RequestBody FonctionnaliteDTO dto) {
        Fonctionnalite updated = fonctionnaliteService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        fonctionnaliteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
