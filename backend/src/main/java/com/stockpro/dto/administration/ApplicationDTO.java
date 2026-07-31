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
public class ApplicationDTO {

    private UUID idApp;

    @NotBlank(message = "Le code application est obligatoire")
    @Size(max = 30, message = "Le code application ne doit pas dépasser 30 caractères")
    private String codeApp;

    @NotBlank(message = "Le nom de l'application est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    private String nomApp;

    @Size(max = 2000, message = "La description est trop longue")
    private String description;

    @Size(max = 20)
    private String version;
}
