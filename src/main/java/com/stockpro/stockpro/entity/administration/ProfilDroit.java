package com.stockpro.stockpro.entity.administration;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "PROFIL_DROIT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilDroit {

    @Id
    @Column(name = "ID_PROFIL_DROIT", length = 32, nullable = false, updatable = false)
    private String idProfilDroit;

    // Relation "PossedeDroit"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PR", nullable = false)
    private Profil profil;

    // Relation "Concerne"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_FONCTIONNALITE", nullable = false)
    private Fonctionnalite fonctionnalite;

    @Column(name = "F_CONSULTATION")
    private Boolean consultation;

    @Column(name = "F_AJOUT")
    private Boolean ajout;

    @Column(name = "F_SUPPRESSION")
    private Boolean suppression;

    @Column(name = "F_IMPRESSION")
    private Boolean impression;

    @Column(name = "F_EXPORT")
    private Boolean export;

    @Column(name = "F_MODIFICATION")
    private Boolean modification;

    @PrePersist
    public void prePersist() {
        if (this.idProfilDroit == null) {
            this.idProfilDroit = UUID.randomUUID().toString().replace("-", "");
        }
    }
}