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
public class GroupeRoleDTO {

    private UUID idGroupeRole;

    @NotBlank(message = "L'idRl est obligatoire")
    private UUID idRl;

    @NotBlank(message = "L'idGr est obligatoire")
    private UUID idGr;

    private Boolean actif;
    private LocalDate dateCreation;
}
