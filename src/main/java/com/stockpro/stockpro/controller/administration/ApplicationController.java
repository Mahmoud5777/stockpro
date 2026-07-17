package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.Application;
import com.stockpro.stockpro.mapper.administration.ApplicationMapper;
import com.stockpro.stockpro.service.administration.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
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

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Applications", description = "Gestion des applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationMapper mapper;

    @Operation(summary = "Lister les applications (paginé)")
    @GetMapping
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @Operation(summary = "Rechercher une application par nom ou code")
    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<ApplicationDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomApp") Pageable pageable) {
        Page<ApplicationDTO> page = applicationService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(applicationService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApplicationDTO> create(@Valid @RequestBody ApplicationDTO dto) {
        Application created = applicationService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationDTO> update(@PathVariable String id, @Valid @RequestBody ApplicationDTO dto) {
        Application updated = applicationService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        applicationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
