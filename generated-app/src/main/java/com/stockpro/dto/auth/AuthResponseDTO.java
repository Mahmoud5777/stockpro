package com.stockpro.dto.auth;

import lombok.*;

import java.util.UUID;

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
    private UUID idUtil;
    private long expiresInMs;
    private Boolean doitChangerMdp;
}
