package com.stockpro.dto.administration;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private UUID idUtil;

    @NotBlank(message = "Le nom complet est obligatoire")
    @Size(max = 150)
    private String nomComplet;

    @NotBlank(message = "Le login est obligatoire")
    @Size(min = 3, max = 100)
    private String login;

    // Ecriture uniquement : jamais renvoyé dans les réponses JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String motPasse;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @Size(max = 20)
    private String telephone;

    private Boolean etatCompte;

    private Boolean DoitChangerMdp;

    private LocalDate dateCreation;
}
