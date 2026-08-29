package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "USER_SITE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSite {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "ROLE_UTILISATEUR", length = 50)
private String roleUtilisateur;

@Column(name = "DATE_AFFECTATION")
private LocalDate dateAffectation;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "USER_ID", nullable = false)
private User user;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "SITE_ID", nullable = false)
private Site site;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }