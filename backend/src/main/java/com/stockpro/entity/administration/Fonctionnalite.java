package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "FONCTIONNALITE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fonctionnalite {

    @Id
    @Column(name = "ID_FONCTIONNALITE", length = 32, nullable = false, updatable = false)
    private String idFonc;

    @Column(name = "COD_FONCTIONNALITE", length = 30)
    private String codeFonc;

    @Column(name = "LIB_FONCTIONNALITE", length = 150)
    private String libelle;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "URL", length = 255)
    private String url;

    @Column(name = "ICONE", length = 255)
    private String icone;

    @Column(name = "ORDER_AFFICHAGE")
    private Integer orderAffichage;

    @Column(name = "F_ACTIF")
    private Boolean actif;

    // Relation "Contient" : une Application contient plusieurs Fonctionnalite
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_APPLICATION", nullable = false)
    private Application application;

    // Relation "FonctionMere/FonctionFille" : auto-référence hiérarchique
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "FON_ID_FONCTIONNALITE")
    private Fonctionnalite fonctionMere;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "fonctionMere", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Fonctionnalite> sousFonctions = new ArrayList<>();

    // Relation "Concerne" : une Fonctionnalite est concernée par plusieurs ProfilDroit
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "fonctionnalite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfilDroit> profilDroits = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idFonc == null) {
            this.idFonc = UUID.randomUUID().toString().replace("-", "");
        }
    }
}