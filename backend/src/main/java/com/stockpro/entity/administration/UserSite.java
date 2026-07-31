package com.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "USER_SITE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSite {

    @Id
    @Column(name = "ID_UTIL_SITE", length = 32, nullable = false, updatable = false)
    private UUID idUtilSite;

    // Relation "EstRattacheA"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_SITE", nullable = false)
    private Site site;

    // Relation "Possede"
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_UTIL", nullable = false)
    private User user;

    @Column(name = "DAT_AFFECTATION")
    private LocalDate dateAffectation;

    // Relation "DisposeDe" : un UserSite dispose de plusieurs UserSiteDroits
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "userSite", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSiteDroits> userSiteDroits = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idUtilSite == null) {
            this.idUtilSite = UUID.randomUUID();
        }
        if (this.dateAffectation == null) {
            this.dateAffectation = LocalDate.now();
        }
    }
}