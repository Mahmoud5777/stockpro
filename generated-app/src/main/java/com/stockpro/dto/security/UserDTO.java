package com.stockpro.dto.security;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

private UUID id;

@NotBlank(message = "Le nom d'utilisateur est obligatoire")
private String username;

@NotBlank(message = "L'adresse email est obligatoire")
private String email;

@NotBlank(message = "Le mot de passe est obligatoire")
// Ecriture uniquement : jamais renvoyé dans les réponses JSON
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private String password;

private String prenom;

private String nom;

private Boolean estActif;

// Référence plate vers Site (jamais l'entité complète dans un DTO)
private UUID siteId;

}