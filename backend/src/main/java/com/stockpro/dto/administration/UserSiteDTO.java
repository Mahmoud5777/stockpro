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
public class UserSiteDTO {

    private UUID idUtilSite;

    @NotBlank(message = "L'idUtil est obligatoire")
    private UUID idUtil;

    @NotBlank(message = "L'idSite est obligatoire")
    private UUID idSite;

    private LocalDate dateAffectation;
}
