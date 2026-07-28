package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfilDroitDTO {

    private String idProfilDroit;

    @NotBlank(message = "L'idPr est obligatoire")
    private String idPr;

    @NotBlank(message = "L'idFonc est obligatoire")
    private String idFonc;

    private Boolean consultation;
    private Boolean ajout;
    private Boolean suppression;
    private Boolean impression;
    private Boolean export;
    private Boolean modification;
}
