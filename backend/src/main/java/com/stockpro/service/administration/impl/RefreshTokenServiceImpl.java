package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.RefreshToken;
import com.stockpro.entity.administration.User;
import com.stockpro.exception.TokenRefreshException;
import com.stockpro.repository.administration.RefreshTokenRepository;
import com.stockpro.service.administration.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration-ms:604800000}") // 7 jours par défaut
    private long refreshExpirationMs;

    @Override
    public RefreshToken create(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .dateExpiration(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken findByToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token introuvable"));
    }

    @Override
    public RefreshToken verify(RefreshToken token) {
        if (Boolean.TRUE.equals(token.getRevoked())) {
            throw new TokenRefreshException("Refresh token révoqué, veuillez vous reconnecter");
        }
        if (token.getDateExpiration().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException("Refresh token expiré, veuillez vous reconnecter");
        }
        return token;
    }

    @Override
    public void revoke(RefreshToken token) {
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    @Override
    public void revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Override
    public RefreshToken rotate(RefreshToken oldToken) {
        revoke(oldToken);
        return create(oldToken.getUser());
    }
}
