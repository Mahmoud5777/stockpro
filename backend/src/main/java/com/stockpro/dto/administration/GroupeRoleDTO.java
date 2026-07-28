package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeRoleDTO {

    private String idGroupeRole;

    @NotBlank(message = "L'idRl est obligatoire")
    private String idRl;

    @NotBlank(message = "L'idGr est obligatoire")
    private String idGr;

    private Boolean actif;
    private LocalDate dateCreation;
}
