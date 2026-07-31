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
public class UserSiteDroitsDTO {

    private UUID idUserSiteDroit;

    @NotBlank(message = "L'idUtilSite est obligatoire")
    private UUID idUtilSite;

    private UUID idRl;
    private UUID idPr;
    private UUID idGr;

    private LocalDate dateAffectation;
}
