package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDroitsDTO {

    private String idUserSiteDroit;

    @NotBlank(message = "L'idUtilSite est obligatoire")
    private String idUtilSite;

    private String idRl;
    private String idPr;
    private String idGr;

    private LocalDate dateAffectation;
}
