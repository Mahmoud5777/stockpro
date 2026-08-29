package com.stockpro.mapper.security;

import com.stockpro.dto.security.GroupeRoleDTO;
import com.stockpro.entity.security.GroupeRole;
import org.springframework.stereotype.Component;

@Component
public class GroupeRoleMapper {

    public GroupeRoleDTO toDto(GroupeRole entity) {
        if (entity == null) {
            return null;
        }
        GroupeRoleDTO.GroupeRoleDTOBuilder builder = GroupeRoleDTO.builder()
                .id(entity.getId())
                .groupId(entity.getGroup() != null ? entity.getGroup().getId() : null)
                .roleId(entity.getRole() != null ? entity.getRole().getId() : null)
;
        return builder.build();
    }

    public GroupeRole toEntity(GroupeRoleDTO dto) {
        if (dto == null) {
            return null;
        }
        GroupeRole.GroupeRoleBuilder builder = GroupeRole.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}