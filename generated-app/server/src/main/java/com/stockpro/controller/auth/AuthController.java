package com.stockpro.controller.auth;

import com.stockpro.dto.auth.AuthResponseDTO;
import com.stockpro.dto.auth.LoginRequestDTO;
import com.stockpro.dto.auth.MeResponseDTO;
import com.stockpro.dto.auth.RefreshRequestDTO;
import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.security.JwtService;
import com.stockpro.service.administration.RefreshTokenService;
import com.stockpro.service.auth.AuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final AuthorizationService authorizationService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getLogin());
        User user = userRepository.findByLogin(request.getLogin())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(user);
        return ResponseEntity.ok(buildResponse(user, accessToken, refreshToken.getToken()));
    }

    @PostMapping("/refresh")
    @Transactional
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO request) {
        RefreshToken existing = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verify(existing);
        User user = existing.getUser();
        RefreshToken newRefreshToken = refreshTokenService.rotate(existing);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());
        String accessToken = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(buildResponse(user, accessToken, newRefreshToken.getToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequestDTO request) {
        RefreshToken existing = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.revoke(existing);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponseDTO> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByLogin(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        MeResponseDTO response = MeResponseDTO.builder()
                .idUtil(user.getIdUtil())
                .nomComplet(user.getNomComplet())
                .login(user.getLogin())
                .email(user.getEmail())
                .doitChangerMdp(Boolean.TRUE.equals(user.getDoitChangerMdp()))
                .sites(authorizationService.resolveSites(user.getIdUtil()))
                .fonctionnalites(authorizationService.resolveFonctionnalites(user.getIdUtil()))
                .build();
        return ResponseEntity.ok(response);
    }

    private AuthResponseDTO buildResponse(User user, String accessToken, String refreshToken) {
        return AuthResponseDTO.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .login(user.getLogin())
                .idUtil(user.getIdUtil())
                .expiresInMs(jwtService.getExpirationMs())
                .doitChangerMdp(Boolean.TRUE.equals(user.getDoitChangerMdp()))
                .build();
    }
}
