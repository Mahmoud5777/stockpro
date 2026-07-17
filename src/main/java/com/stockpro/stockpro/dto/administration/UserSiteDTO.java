package com.stockpro.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDTO {

    private String idUtilSite;

    @NotBlank(message = "L'idUtil est obligatoire")
    private String idUtil;

    @NotBlank(message = "L'idSite est obligatoire")
    private String idSite;

    private LocalDate dateAffectation;
}
