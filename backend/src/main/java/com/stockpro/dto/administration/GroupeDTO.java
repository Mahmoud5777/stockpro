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
public class GroupeDTO {

    private UUID idGr;

    @NotBlank(message = "Le code groupe est obligatoire")
    @Size(max = 30)
    private String codeGroupe;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100)
    private String libelle;

    private String description;
}
