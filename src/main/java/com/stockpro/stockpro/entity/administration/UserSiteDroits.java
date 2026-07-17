package com.stockpro.stockpro.entity.administration;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "USER_SITE_DROITS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDroits {

    @Id
    @Column(name = "ID_USER_SITE_DROIT", length = 32, nullable = false, updatable = false)
    private String idUserSiteDroit;

    // Relation "AffecteRole" (optionnelle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_RL")
    private Role role;

    // Relation "DisposeDe"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTIL_SITE", nullable = false)
    private UserSite userSite;

    // Relation "AffecteProfil" (optionnelle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_PR")
    private Profil profil;

    // Relation "AffecteGroupe" (optionnelle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_GR")
    private Groupe groupe;

    @Column(name = "DAT_AFFECTATION")
    private LocalDate dateAffectation;

    @PrePersist
    public void prePersist() {
        if (this.idUserSiteDroit == null) {
            this.idUserSiteDroit = UUID.randomUUID().toString().replace("-", "");
        }
        if (this.dateAffectation == null) {
            this.dateAffectation = LocalDate.now();
        }
    }
}