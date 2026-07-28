package com.stockpro.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefreshRequestDTO {

    @NotBlank(message = "Le refresh token est obligatoire")
    private String refreshToken;
}
