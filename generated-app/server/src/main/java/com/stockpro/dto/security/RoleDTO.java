package com.stockpro.dto.security;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleDTO {

private UUID id;

@NotBlank(message = "Le code rôle est obligatoire")
private String codeRole;

@NotBlank(message = "Le libellé est obligatoire")
private String libelle;

private String description;

}