package com.stockpro.dto.security;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDTO {

private UUID id;

@NotBlank(message = "Le nom du groupe est obligatoire")
private String nom;

@NotBlank(message = "Le code du groupe est obligatoire")
private String code;

private String description;

}