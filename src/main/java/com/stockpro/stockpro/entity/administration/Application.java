package com.stockpro.stockpro.entity.administration;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "APPLICATION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @Column(name = "ID_APPLICATION", length = 32, nullable = false, updatable = false)
    private String idApp;

    @Column(name = "COD_APPLICATION", length = 30)
    private String codeApp;

    @Column(name = "LIB_APPLICATION", length = 100)
    private String nomApp;

    @Column(name = "DESCRIPTION", columnDefinition = "TEXT")
    private String description;

    @Column(name = "VERSION", length = 20)
    private String version;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Fonctionnalite> fonctionnalites = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.idApp == null) {
            this.idApp = UUID.randomUUID().toString().replace("-", "");
        }
    }
}