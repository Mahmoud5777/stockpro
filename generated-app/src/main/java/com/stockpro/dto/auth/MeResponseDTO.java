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
    private Boolean doitChangerMdp;
    private List<SiteAllegeDTO> sites;
    private List<FonctionnaliteAvecDroitsDTO> fonctionnalites;
}
