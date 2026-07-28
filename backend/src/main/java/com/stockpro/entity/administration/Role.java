package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ROLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @Column(name = "ID_RL", length = 32, nullable = false, updatable = false)
    private String idRl;

    @Column(name = "COD_ROLE", length = 30, unique = true)
    private String codeRole;

    @Column(name = "LIB_ROLE", length = 100)
    private String libelle;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    // Relation "AffecteRole" : un Role peut être affecté à plusieurs UserSiteDroits
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private List<UserSiteDroits> userSiteDroits = new ArrayList<>();

    // Relation "AppartientGroupe" : un Role est associé à plusieurs Groupe via GROUPE_ROLE
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupeRole> groupeRoles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idRl == null) {
            this.idRl = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
