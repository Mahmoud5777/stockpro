package com.stockpro.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeProfilDTO {

    private String idGroupeProfil;

    @NotBlank(message = "L'idGr est obligatoire")
    private String idGr;

    @NotBlank(message = "L'idPr est obligatoire")
    private String idPr;

    private Boolean actif;
    private LocalDate dateCreation;
}
