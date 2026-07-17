package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.ProfilDroitDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.ProfilDroit;
import com.stockpro.stockpro.mapper.administration.ProfilDroitMapper;
import com.stockpro.stockpro.service.administration.ProfilDroitService;
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
@RequestMapping("/api/profil-droits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Droits de profil", description = "Gestion des droits par profil et fonctionnalité")
public class ProfilDroitController {

    private final ProfilDroitService profilDroitService;
    private final ProfilDroitMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<ProfilDroitDTO>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ProfilDroitDTO> page = profilDroitService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfilDroitDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(profilDroitService.findById(id)));
    }

    @GetMapping("/profil/{idPr}")
    public ResponseEntity<List<ProfilDroitDTO>> getByProfil(@PathVariable String idPr) {
        List<ProfilDroitDTO> result = profilDroitService.findByProfil(idPr)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/fonctionnalite/{idFonc}")
    public ResponseEntity<List<ProfilDroitDTO>> getByFonctionnalite(@PathVariable String idFonc) {
        List<ProfilDroitDTO> result = profilDroitService.findByFonctionnalite(idFonc)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<ProfilDroitDTO> create(@Valid @RequestBody ProfilDroitDTO dto) {
        ProfilDroit created = profilDroitService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfilDroitDTO> update(@PathVariable String id, @Valid @RequestBody ProfilDroitDTO dto) {
        ProfilDroit updated = profilDroitService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        profilDroitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
