package com.stockpro.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FonctionnaliteAvecDroitsDTO {
    private String idFonctionnalite;
    private String codFonctionnalite;
    private String libFonctionnalite;
    private String description;
    private String url;
    private String icone;
    private Integer orderAffichage;
    private boolean actif;
    private String idApplication;
    private String parentIdFonctionnalite;
    private DroitsDTO droits;
}
