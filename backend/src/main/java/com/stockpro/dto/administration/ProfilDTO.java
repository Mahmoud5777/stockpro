package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilDTO {

    private UUID idPr;

    @NotBlank(message = "Le code profil est obligatoire")
    @Size(max = 30)
    private String codeProfil;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100)
    private String libelle;

    private String description;
}
