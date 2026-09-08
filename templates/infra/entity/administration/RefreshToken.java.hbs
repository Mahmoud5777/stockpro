package com.stockpro.entity.administration;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "REFRESH_TOKEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshToken {

    @Id
    @Column(name = "ID_REFRESH_TOKEN", length = 32, nullable = false, updatable = false)
    private UUID idRefreshToken;

    // Token opaque (UUID aléatoire), pas un JWT : permet la révocation côté serveur
    @Column(name = "TOKEN", length = 255, nullable = false, unique = true)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTIL", nullable = false)
    private User user;

    @Column(name = "DATE_EXPIRATION", nullable = false)
    private LocalDateTime dateExpiration;

    @Builder.Default
    @Column(name = "REVOKED", nullable = false)
    private Boolean revoked = false;

    @Column(name = "DATE_CREATION")
    private LocalDateTime dateCreation;

    @PrePersist
    public void prePersist() {
        if (this.idRefreshToken == null) {
            this.idRefreshToken = UUID.randomUUID();
        }
        if (this.token == null) {
            this.token = UUID.randomUUID().toString();
        }
        if (this.dateCreation == null) {
            this.dateCreation = LocalDateTime.now();
        }
        if (this.revoked == null) {
            this.revoked = false;
        }
    }
}
