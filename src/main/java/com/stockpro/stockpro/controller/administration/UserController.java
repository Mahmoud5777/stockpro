package com.stockpro.stockpro.controller.administration;

import com.stockpro.stockpro.dto.administration.UserDTO;
import com.stockpro.stockpro.dto.common.PageResponseDTO;
import com.stockpro.stockpro.entity.administration.User;
import com.stockpro.stockpro.mapper.administration.UserMapper;
import com.stockpro.stockpro.service.administration.UserService;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Utilisateurs", description = "Gestion des utilisateurs")
public class UserController {

    private final UserService userService;
    private final UserMapper mapper;

    @GetMapping
    public ResponseEntity<PageResponseDTO<UserDTO>> getAll(
            @PageableDefault(size = 20, sort = "nomComplet") Pageable pageable) {
        Page<UserDTO> page = userService.findAll(pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponseDTO<UserDTO>> search(
            @RequestParam String q,
            @PageableDefault(size = 20, sort = "nomComplet") Pageable pageable) {
        Page<UserDTO> page = userService.search(q, pageable).map(mapper::toDto);
        return ResponseEntity.ok(PageResponseDTO.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(mapper.toDto(userService.findById(id)));
    }

    @GetMapping("/login/{login}")
    public ResponseEntity<UserDTO> getByLogin(@PathVariable String login) {
        return ResponseEntity.ok(mapper.toDto(userService.findByLogin(login)));
    }

    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody UserDTO dto) {
        User created = userService.create(mapper.toEntity(dto));
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable String id, @Valid @RequestBody UserDTO dto) {
        User updated = userService.update(id, mapper.toEntity(dto));
        return ResponseEntity.ok(mapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
