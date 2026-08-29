package com.stockpro.dto.security;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSiteDTO {

private UUID id;

private String roleUtilisateur;

private LocalDate dateAffectation;

// Référence plate vers User (jamais l'entité complète dans un DTO)
private UUID userId;

// Référence plate vers Site (jamais l'entité complète dans un DTO)
private UUID siteId;

}