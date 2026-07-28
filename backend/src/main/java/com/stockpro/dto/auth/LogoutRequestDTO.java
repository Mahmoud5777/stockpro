package com.stockpro.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogoutRequestDTO {

    @NotBlank(message = "Le refresh token est obligatoire")
    private String refreshToken;
}
