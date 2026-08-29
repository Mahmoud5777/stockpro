package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "USERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "USERNAME", length = 50, unique =
true, nullable = false)
private String username;

@Column(name = "EMAIL", length = 100, unique =
true, nullable = false)
private String email;

// Ecriture uniquement : jamais renvoyé dans les réponses JSON
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
@Column(name = "PASSWORD", length = 255, nullable = false)
private String password;

@Column(name = "PRENOM", length = 50)
private String prenom;

@Column(name = "NOM", length = 50)
private String nom;

@Column(name = "EST_ACTIF")
private Boolean estActif;

// Relation ""
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "SITE_ID")
private Site site;

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }