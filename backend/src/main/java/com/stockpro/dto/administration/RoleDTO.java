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
public class RoleDTO {

    private UUID idRl;

    @NotBlank(message = "Le code rôle est obligatoire")
    @Size(max = 30)
    private String codeRole;

    @NotBlank(message = "Le libellé est obligatoire")
    @Size(max = 100)
    private String libelle;

    private String description;
}
