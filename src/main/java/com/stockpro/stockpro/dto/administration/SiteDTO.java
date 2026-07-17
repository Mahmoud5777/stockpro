package com.stockpro.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteDTO {

    private String idSite;

    @NotBlank(message = "Le code site est obligatoire")
    @Size(max = 30)
    private String codeSite;

    @NotBlank(message = "Le nom du site est obligatoire")
    @Size(max = 100)
    private String nomSite;

    private String description;

    private String address;

    private String idSiteParent;
}
