package com.stockpro.controller.administration;

import com.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.dto.common.PageResponseDTO;
import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.mapper.administration.FonctionnaliteMapper;
import com.stockpro.service.administration.FonctionnaliteService;
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

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fonctionnalites")
@RequiredArgsConstructor
@Tag(name = "Fonctionnalités", description = "Gestion des fonctionnalités applicatives")
public class FonctionnaliteController {

    private final FonctionnaliteService fonctionnaliteService;
    private final FonctionnaliteMapper mapper;

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping
    public ResponseEntity<PageResponseDTO<FonctionnaliteDTO>> getAll(
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<FonctionnaliteDTO> page = fonctionnaliteService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<FonctionnaliteDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "libelle") Pageable pageable) {
        Page<FonctionnaliteDTO> page = fonctionnaliteService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(fonctionnaliteService.findById(id)));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/all")
    public ResponseEntity<List<FonctionnaliteDTO>> getAllUnpaged() {
        List<FonctionnaliteDTO> result = fonctionnaliteService.findAll()
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/application/{idApp}")
    public ResponseEntity<List<FonctionnaliteDTO>> getByApplication(@PathVariable String idApp) {
        List<FonctionnaliteDTO> result = fonctionnaliteService.findByApplication(idApp)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'CONSULTATION')")
    @GetMapping("/racines")
    public ResponseEntity<List<FonctionnaliteDTO>> getRacines() {
        List<FonctionnaliteDTO> result = fonctionnaliteService.findRacines()
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'AJOUT')")
    @PostMapping
    public ResponseEntity<FonctionnaliteDTO> create(@Valid @RequestBody FonctionnaliteDTO dto) {
        Fonctionnalite created = fonctionnaliteService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'MODIFICATION')")
    @PutMapping("/{id}")
    public ResponseEntity<FonctionnaliteDTO> update(@PathVariable String id, @Valid @RequestBody FonctionnaliteDTO dto) {
        Fonctionnalite updated = fonctionnaliteService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @PreAuthorize("@accessGuard.can(authentication, 'ADMIN_FONCTIONNALITES', 'SUPPRESSION')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        fonctionnaliteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
