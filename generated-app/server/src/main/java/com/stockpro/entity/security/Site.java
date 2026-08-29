package com.stockpro.entity.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "SITES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

@Id
@Column(name = "ID",, length = 32, nullable = false, updatable = false)
private UUID id;

@Column(name = "NOM", length = 100, unique =
true, nullable = false)
private String nom;

@Column(name = "CODE", length = 20, unique =
true, nullable = false)
private String code;

@Column(name = "DESCRIPTION", columnDefinition =
"TEXT")
private String description;

// Relation "AppartientSite" : un Site possède plusieurs User
@JsonIgnore
@Builder.Default
@OneToMany(mappedBy = "site", cascade = CascadeType.ALL)
private List<User> users = new ArrayList<>();

        @PrePersist
        public void prePersist() {
        if (this.id == null) {
        this.id = UUID.randomUUID();
        }
        }
        }