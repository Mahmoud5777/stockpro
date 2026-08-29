package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "USER_SITE_DROITS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDroits {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "CODE_DROIT", length = 50, unique =
true, nullable = false)
private String codeDroit;

@Column(name = "LIBELLE_DROIT", length = 100, nullable = false)
private String libelleDroit;

@Column(name = "EST_EXPORT")
private Boolean estExporte;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "USER_SITE_ID", nullable = false)
private UserSite userSite;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ROLE_ID", nullable = false)
private Role role;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }