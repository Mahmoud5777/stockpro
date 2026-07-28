package com.stockpro.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeCredentialsRequestDTO {

    @NotBlank(message = "Le mot de passe actuel est obligatoire")
    private String currentPassword;

    // Optionnel : permet de changer le login en même temps (ex: admin.temp -> admin)
    private String newLogin;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String newPassword;
}
