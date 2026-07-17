package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.UserSiteDroitsDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.UserSiteDroits;
import com.stockpro.stockpro.mapper.administration.UserSiteDroitsMapper;
import com.stockpro.stockpro.service.administration.UserSiteDroitsService;
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
@RequestMapping("/api/user-site-droits")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Droits Utilisateur-Site", description = "Affectation de rôle/profil/groupe à un utilisateur sur un site")
public class UserSiteDroitsController {

    private final UserSiteDroitsService userSiteDroitsService;
    private final UserSiteDroitsMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<UserSiteDroitsDTO>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        Page<UserSiteDroitsDTO> page = userSiteDroitsService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserSiteDroitsDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(userSiteDroitsService.findById(id)));
    }

    @GetMapping("/user-site/{idUtilSite}")
    public ResponseEntity<List<UserSiteDroitsDTO>> getByUserSite(@PathVariable String idUtilSite) {
        List<UserSiteDroitsDTO> result = userSiteDroitsService.findByUserSite(idUtilSite)
                .stream().map(mapper::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<UserSiteDroitsDTO> create(@Valid @RequestBody UserSiteDroitsDTO dto) {
        UserSiteDroits created = userSiteDroitsService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserSiteDroitsDTO> update(@PathVariable String id, @Valid @RequestBody UserSiteDroitsDTO dto) {
        UserSiteDroits updated = userSiteDroitsService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userSiteDroitsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
