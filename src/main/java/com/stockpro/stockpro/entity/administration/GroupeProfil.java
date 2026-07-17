package com.stockpro.stockpro.entity.administration;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "GROUPE_PROFIL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeProfil {

    @Id
    @Column(name = "ID_GROUPE_PROFIL", length = 32, nullable = false, updatable = false)
    private String idGroupeProfil;

    // Relation "ContientProfil"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_GR", nullable = false)
    private Groupe groupe;

    // Relation "EstAssocieA"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PR", nullable = false)
    private Profil profil;

    @Column(name = "F_ACTIF")
    private Boolean actif;

    @Column(name = "DAT_CREATION")
    private LocalDate dateCreation;

    @PrePersist
    public void prePersist() {
        if (this.idGroupeProfil == null) {
            this.idGroupeProfil = UUID.randomUUID().toString().replace("-", "");
        }
        if (this.dateCreation == null) {
            this.dateCreation = LocalDate.now();
        }
    }
}
