package com.stockpro.dto.auth;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeResponseDTO {
    private UUID idUtil;
    private String nomComplet;
    private String login;
    private String email;
    private boolean doitChangerMdp;
    private List<SiteAllegeDTO> sites;
    // Fusion des droits de TOUS les sites de l'utilisateur (via profils directs
    // et profils portés par ses groupes). Voir AuthorizationService.
    private List<FonctionnaliteAvecDroitsDTO> fonctionnalites;
}
