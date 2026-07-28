package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "GROUPE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Groupe {

    @Id
    @Column(name = "ID_GR", length = 32, nullable = false, updatable = false)
    private String idGr;

    @Column(name = "COD_GROUPE", length = 30)
    private String codeGroupe;

    @Column(name = "LIB_GROUPE", length = 100)
    private String libelle;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    // Relation "AffecteGroupe" : un Groupe peut être affecté à plusieurs UserSiteDroits
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL)
    private List<UserSiteDroits> userSiteDroits = new ArrayList<>();

    // Relation "ContientProfil" : un Groupe est associé à plusieurs Profil via GROUPE_PROFIL
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupeProfil> groupeProfils = new ArrayList<>();

    // Relation "PossedeRole" : un Groupe est associé à plusieurs Role via GROUPE_ROLE
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "groupe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupeRole> groupeRoles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idGr == null) {
            this.idGr = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
