package com.stockpro.dto.administration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FonctionnaliteDTO {

    private String idFonc;

    @NotBlank(message = "Le code fonctionnalité est obligatoire")
    @Size(max = 30)
    private String codeFonc;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 150, message = "Le libellé ne doit pas dépasser 150 caractères")
    private String libelle;

    private String description;

    @Size(max = 255)
    private String url;

    @Size(max = 255)
    private String icone;

    private Integer orderAffichage;

    private Boolean actif;

    @NotBlank(message = "L'idApp est obligatoire")
    private String idApp;

    private String idFoncMere;
}
