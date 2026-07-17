package com.stockpro.stockpro.controller.auth;

import com.stockpro.stockpro.dto.auth.AuthResponseDTO;
import com.stockpro.stockpro.dto.auth.LoginRequestDTO;
import com.stockpro.stockpro.dto.auth.RegisterRequestDTO;
import com.stockpro.stockpro.entity.administration.User;
import com.stockpro.stockpro.security.JwtService;
import com.stockpro.stockpro.service.administration.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentification", description = "Login et inscription")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserService userService;

    @Operation(summary = "Connexion : retourne un token JWT")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getLogin());
        String token = jwtService.generateToken(userDetails);
        User user = userService.findByLogin(request.getLogin());

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .login(user.getLogin())
                .idUtil(user.getIdUtil())
                .expiresInMs(jwtService.getExpirationMs())
                .build();

        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Inscription d'un nouvel utilisateur")
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        User user = User.builder()
                .nomComplet(request.getNomComplet())
                .login(request.getLogin())
                .motPasse(request.getPassword())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .etatCompte(true)
                .build();

        User created = userService.create(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(created.getLogin());
        String token = jwtService.generateToken(userDetails);

        AuthResponseDTO response = AuthResponseDTO.builder()
                .token(token)
                .tokenType("Bearer")
                .login(created.getLogin())
                .idUtil(created.getIdUtil())
                .expiresInMs(jwtService.getExpirationMs())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
