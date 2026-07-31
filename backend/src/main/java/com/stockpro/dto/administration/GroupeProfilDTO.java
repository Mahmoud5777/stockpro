package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeProfilDTO {

    private UUID idGroupeProfil;

    @NotBlank(message = "L'idGr est obligatoire")
    private UUID idGr;

    @NotBlank(message = "L'idPr est obligatoire")
    private UUID idPr;

    private Boolean actif;
    private LocalDate dateCreation;
}
