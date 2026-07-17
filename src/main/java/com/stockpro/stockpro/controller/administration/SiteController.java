package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.SiteDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Site;
import com.stockpro.stockpro.mapper.administration.SiteMapper;
import com.stockpro.stockpro.service.administration.SiteService;
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
@RequestMapping("/api/sites")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Sites", description = "Gestion des sites")
public class SiteController {

    private final SiteService siteService;
    private final SiteMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<SiteDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<SiteDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomSite") Pageable pageable) {
        Page<SiteDTO> page = siteService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(siteService.findById(id)));
    }

    @GetMapping("/racines")
    public ResponseEntity<List<SiteDTO>> getRacines() {
        List<SiteDTO> result = siteService.findRacines().stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/enfants")
    public ResponseEntity<List<SiteDTO>> getEnfants(@PathVariable String id) {
        List<SiteDTO> result = siteService.findEnfants(id).stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<SiteDTO> create(@Valid @RequestBody SiteDTO dto) {
        Site created = siteService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteDTO> update(@PathVariable String id, @Valid @RequestBody SiteDTO dto) {
        Site updated = siteService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        siteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
