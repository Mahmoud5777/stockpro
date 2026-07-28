package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "PROFIL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profil {

    @Id
    @Column(name = "ID_PR", length = 32, nullable = false, updatable = false)
    private String idPr;

    @Column(name = "COD_PROFIL", length = 30, nullable = false, unique = true)
    private String codeProfil;

    @Column(name = "LIB_PROFIL", length = 100)
    private String libelle;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    // Relation "PossedeDroit" : un Profil possède plusieurs ProfilDroit
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfilDroit> profilDroits = new ArrayList<>();

    // Relation "AffecteProfil" : un Profil peut être affecté à plusieurs UserSiteDroits
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL)
    private List<UserSiteDroits> userSiteDroits = new ArrayList<>();

    // Relation "EstAssocieA" : un Profil est associé à plusieurs Groupe via GROUPE_PROFIL
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "profil", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupeProfil> groupeProfils = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idPr == null) {
            this.idPr = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
