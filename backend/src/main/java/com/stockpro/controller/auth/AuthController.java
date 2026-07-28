package com.stockpro.controller.auth;

import com.stockpro.dto.auth.AuthResponseDTO;
import com.stockpro.dto.auth.ChangeCredentialsRequestDTO;
import com.stockpro.dto.auth.LoginRequestDTO;
import com.stockpro.dto.auth.LogoutRequestDTO;
import com.stockpro.dto.auth.MeResponseDTO;
import com.stockpro.dto.auth.RefreshRequestDTO;
import com.stockpro.dto.auth.RegisterRequestDTO;
import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;
import com.stockpro.entity.audit.AuditAction;
import com.stockpro.security.JwtService;
import com.stockpro.service.administration.RefreshTokenService;
import com.stockpro.service.administration.UserService;
import com.stockpro.service.audit.AuditService;
import com.stockpro.service.auth.AuthorizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentification", description = "Login, inscription, rafraîchissement et déconnexion")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final AuditService auditService;
    private final AuthorizationService authorizationService;

    @Operation(summary = "Connexion : retourne un access token (JWT) et un refresh token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        // Déclenche AuthenticationSuccessEvent / AbstractAuthenticationFailureEvent,
        // capturés automatiquement par AuditAuthenticationEventListener.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getLogin());
        User user = userService.findByLogin(request.getLogin());

        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(user);

        return ResponseEntity.ok(buildResponse(user, accessToken, refreshToken.getToken()));
    }

    @Operation(summary = "Inscription d'un nouvel utilisateur")
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request,
                                                    HttpServletRequest httpRequest) {
        User user = User.builder()
                .nomComplet(request.getNomComplet())
                .login(request.getLogin())
                .motPasse(request.getPassword())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .etatCompte(true)
                .build();

        User created = userService.create(user);
        auditService.log(AuditAction.LOGIN_SUCCESS, created.getLogin(), created.getIdUtil(),
                httpRequest, 201, "Création de compte");

        UserDetails userDetails = userDetailsService.loadUserByUsername(created.getLogin());
        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(created);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(buildResponse(created, accessToken, refreshToken.getToken()));
    }

    @Operation(summary = "Obtenir un nouvel access token à partir d'un refresh token valide")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshRequestDTO request,
                                                   HttpServletRequest httpRequest) {
        RefreshToken existing = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.verify(existing);

        User user = existing.getUser();
        // Rotation : l'ancien refresh token est révoqué, un nouveau est émis.
        // Limite la fenêtre d'exploitation si un refresh token venait à fuiter.
        RefreshToken newRefreshToken = refreshTokenService.rotate(existing);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getLogin());
        String newAccessToken = jwtService.generateToken(userDetails);

        auditService.log(AuditAction.REFRESH_TOKEN, user.getLogin(), user.getIdUtil(), httpRequest, 200, null);

        return ResponseEntity.ok(buildResponse(user, newAccessToken, newRefreshToken.getToken()));
    }

    @Operation(summary = "Déconnexion : révoque le refresh token fourni")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody LogoutRequestDTO request,
                                       HttpServletRequest httpRequest) {
        RefreshToken existing = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.revoke(existing);

        User user = existing.getUser();
        auditService.log(AuditAction.LOGOUT, user.getLogin(), user.getIdUtil(), httpRequest, 204, null);

        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Retourne l'utilisateur actuellement authentifié, avec ses droits résolus")
    @GetMapping("/me")
    public ResponseEntity<MeResponseDTO> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByLogin(authentication.getName());

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

    @Operation(summary = "Change le login/mot de passe de l'utilisateur connecté "
            + "(obligatoire si doitChangerMdp = true, ex: comptes temporaires)")
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponseDTO> changePassword(@Valid @RequestBody ChangeCredentialsRequestDTO request,
                                                          HttpServletRequest httpRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User current = userService.findByLogin(authentication.getName());

        // IMPORTANT : si newLogin est renseigné, le login de l'utilisateur change en base.
        // L'ancien access token (dont le "subject" JWT est l'ancien login) devient donc
        // invalide dès cet instant : toute requête ultérieure avec ce token échouera avec
        // UsernameNotFoundException. Il faut donc régénérer un access token + refresh token
        // à jour et les renvoyer au frontend, exactement comme au login.
        User updated = userService.changeCredentials(current.getIdUtil(), request.getCurrentPassword(),
                request.getNewLogin(), request.getNewPassword());

        auditService.log(AuditAction.LOGIN_SUCCESS, updated.getLogin(), updated.getIdUtil(),
                httpRequest, 200, "Changement des identifiants (mot de passe temporaire)");

        UserDetails userDetails = userDetailsService.loadUserByUsername(updated.getLogin());
        String accessToken = jwtService.generateToken(userDetails);
        RefreshToken refreshToken = refreshTokenService.create(updated);

        return ResponseEntity.ok(buildResponse(updated, accessToken, refreshToken.getToken()));
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