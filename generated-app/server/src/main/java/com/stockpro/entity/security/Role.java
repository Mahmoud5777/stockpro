package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ROLES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "COD_ROLE", length = 30, unique =
true, nullable = false)
private String codeRole;

@Column(name = "LIB_ROLE", length = 100, unique =
true, nullable = false)
private String libelle;

@Column(name = "DESCRIPTION", columnDefinition =
"TEXT")
private String description;

// Relation "AppartientRole" : un Role possède plusieurs UserSiteDroits
@JsonIgnore
@Builder.Default
@OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval =
true)
private List<UserSiteDroits> userSiteDroits = new ArrayList<>();

// Relation "AppartientGroupe" : un Role possède plusieurs GroupeRole
@JsonIgnore
@Builder.Default
@OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval =
true)
private List<GroupeRole> groupeRoles = new ArrayList<>();

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }