package com.stockpro.entity.administration;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "GROUPE_ROLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeRole {

    @Id
    @Column(name = "ID_GROUPE_ROLE", length = 32, nullable = false, updatable = false)
    private UUID idGroupeRole;

    // Relation "AppartientGroupe"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_RL", nullable = false)
    private Role role;

    // Relation "PossedeRole"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_GR", nullable = false)
    private Groupe groupe;

    @Column(name = "F_ACTIF")
    private Boolean actif;

    @Column(name = "DAT_CREATION")
    private LocalDate dateCreation;

    @PrePersist
    public void prePersist() {
        if (this.idGroupeRole == null) {
            this.idGroupeRole = UUID.randomUUID();
        }
        if (this.dateCreation == null) {
            this.dateCreation = LocalDate.now();
        }
    }
}
