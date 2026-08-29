package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "GROUPS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "NOM", length = 50, unique =
true, nullable = false)
private String nom;

@Column(name = "CODE", length = 20, unique =
true, nullable = false)
private String code;

@Column(name = "DESCRIPTION", columnDefinition =
"TEXT")
private String description;

// Relation "AppartientGroupe" : un Group possède plusieurs GroupeRole
@JsonIgnore
@Builder.Default
@OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval =
true)
private List<GroupeRole> groupRoles = new ArrayList<>();

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }