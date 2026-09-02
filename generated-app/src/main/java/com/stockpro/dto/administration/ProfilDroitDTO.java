package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilDroitDTO {

    private UUID idProfilDroit;

    @NotBlank(message = "L'idPr est obligatoire")
    private UUID idPr;

    @NotBlank(message = "L'idFonc est obligatoire")
    private UUID idFonc;

    private Boolean consultation;
    private Boolean ajout;
    private Boolean suppression;
    private Boolean impression;
    private Boolean export;
    private Boolean modification;
}
