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
    @Size(max = 30)
    private String codeApp;

    @NotBlank(message = "Le nom de l'application est obligatoire")
    @Size(max = 100)
    private String nomApp;

    @Size(max = 2000)
    private String description;

    @Size(max = 20)
    private String version;
}
