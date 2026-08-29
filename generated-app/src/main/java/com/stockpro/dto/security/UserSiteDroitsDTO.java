package com.stockpro.dto.security;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDroitsDTO {

private UUID id;

@NotBlank(message = "Le code droit est obligatoire")
private String codeDroit;

@NotBlank(message = "Le libellé du droit est obligatoire")
private String libelleDroit;

private Boolean estExporte;

// Référence plate vers UserSite (jamais l'entité complète dans un DTO)
private UUID userSiteId;

// Référence plate vers Role (jamais l'entité complète dans un DTO)
private UUID roleId;

}