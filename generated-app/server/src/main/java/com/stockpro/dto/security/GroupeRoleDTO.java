package com.stockpro.dto.security;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupeRoleDTO {

private UUID id;

// Référence plate vers Group (jamais l'entité complète dans un DTO)
private UUID groupId;

// Référence plate vers Role (jamais l'entité complète dans un DTO)
private UUID roleId;

}