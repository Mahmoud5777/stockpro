package com.stockpro.mapper.security;

import com.stockpro.dto.security.RoleDTO;
import com.stockpro.entity.security.Role;
import org.springframework.stereotype.Component;

@Component
public class RoleMapper {

    public RoleDTO toDto(Role entity) {
        if (entity == null) {
            return null;
        }
        RoleDTO.RoleDTOBuilder builder = RoleDTO.builder()
                .id(entity.getId())
                .codeRole(entity.getCodeRole())
                .libelle(entity.getLibelle())
                .description(entity.getDescription())
;
        return builder.build();
    }

    public Role toEntity(RoleDTO dto) {
        if (dto == null) {
            return null;
        }
        Role.RoleBuilder builder = Role.builder()
                .id(dto.getId())
                .codeRole(dto.getCodeRole())
                .libelle(dto.getLibelle())
                .description(dto.getDescription())
;
        return builder.build();
    }
}