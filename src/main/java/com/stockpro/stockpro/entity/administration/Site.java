package com.stockpro.stockpro.entity.administration;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "SITE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

    @Id
    @Column(name = "ID_SITE", length = 32, nullable = false, updatable = false)
    private String idSite;

    @Column(name = "COD_SITE", length = 30, unique = true)
    private String codeSite;

    @Column(name = "LIB_SITE", length = 100)
    private String nomSite;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "ADDRESS", columnDefinition = "TEXT")
    private String address;

    // Relation "Hearchie" : auto-référence hiérarchique (SiteParent/SiteAux)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SIT_ID_SITE")
    private Site siteParent;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "siteParent", cascade = CascadeType.ALL)
    private List<Site> sitesEnfants = new ArrayList<>();

    // Relation "EstRattacheA" : un Site est rattaché à plusieurs UserSite
    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL)
    private List<UserSite> userSites = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idSite == null) {
            this.idSite = UUID.randomUUID().toString().replace("-", "");
        }
    }
}