package com.stockpro.entity.audit;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "LOG_ACCES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogAcces {

    @Id
    @Column(name = "ID_LOG", length = 32, nullable = false, updatable = false)
    private UUID idLog;

    // Login "tel que saisi", conservé même si l'utilisateur n'existe pas
    // (utile pour détecter des tentatives de brute-force sur des comptes inexistants)
    @Column(name = "LOGIN", length = 100)
    private String login;

    // Pas de relation JPA vers User : un log d'audit doit survivre
    // même si l'utilisateur est supprimé ou n'a jamais existé.
    @Column(name = "ID_UTIL", length = 32)
    private UUID idUtil;

    @Enumerated(EnumType.STRING)
    @Column(name = "ACTION", length = 30, nullable = false)
    private AuditAction action;

    @Column(name = "METHODE_HTTP", length = 10)
    private String methodeHttp;

    @Column(name = "ENDPOINT", length = 255)
    private String endpoint;

    @Column(name = "STATUT_HTTP")
    private Integer statutHttp;

    @Column(name = "ADRESSE_IP", length = 45)
    private String adresseIp;

    @Column(name = "USER_AGENT", length = 255)
    private String userAgent;

    @Column(name = "DETAILS", columnDefinition = "TEXT")
    private String details;

    @Column(name = "DATE_ACCES", nullable = false)
    private LocalDateTime dateAcces;

    @PrePersist
    public void prePersist() {
        if (this.idLog == null) {
            this.idLog = UUID.randomUUID();
        }
        if (this.dateAcces == null) {
            this.dateAcces = LocalDateTime.now();
        }
    }
}
