package com.stockpro.stockpro.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private String token;
    private String tokenType;
    private String login;
    private String idUtil;
    private long expiresInMs;
}
