package com.stockpro.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "UTILISATEUR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(name = "ID_UTIL", length = 32, nullable = false, updatable = false)
    private String idUtil;

    @Column(name = "NOM_COMPLET", length = 150)
    private String nomComplet;

    @Column(name = "LOGIN", length = 100, unique = true)
    private String login;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "MOT_PASSE", length = 255)
    private String motPasse;

    @Column(name = "EMAIL", length = 150, unique = true)
    private String email;

    @Column(name = "TELEPHONE", length = 20)
    private String telephone;

    @Column(name = "ETAT_COMPTE")
    private Boolean etatCompte;

    @Column(name = "DATE_CREATION")
    private LocalDate dateCreation;

    // Relation "Possede" : un User possède plusieurs UserSite
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSite> userSites = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idUtil == null) {
            this.idUtil = UUID.randomUUID().toString().replace("-", "");
        }
        if (this.dateCreation == null) {
            this.dateCreation = LocalDate.now();
        }
    }
}