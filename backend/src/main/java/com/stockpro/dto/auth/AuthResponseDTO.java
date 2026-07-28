package com.stockpro.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;
    private String refreshToken;
    private String tokenType;
    private String login;
    private String idUtil;
    private long expiresInMs;
    // true = l'utilisateur doit changer son login/mot de passe avant de continuer
    private boolean doitChangerMdp;
}
