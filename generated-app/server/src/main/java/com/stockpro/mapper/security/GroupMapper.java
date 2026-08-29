package com.stockpro.mapper.security;

import com.stockpro.dto.security.GroupDTO;
import com.stockpro.entity.security.Group;
import org.springframework.stereotype.Component;

@Component
public class GroupMapper {

    public GroupDTO toDto(Group entity) {
        if (entity == null) {
            return null;
        }
        GroupDTO.GroupDTOBuilder builder = GroupDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .code(entity.getCode())
                .description(entity.getDescription())
;
        return builder.build();
    }

    public Group toEntity(GroupDTO dto) {
        if (dto == null) {
            return null;
        }
        Group.GroupBuilder builder = Group.builder()
                .id(dto.getId())
                .nom(dto.getNom())
                .code(dto.getCode())
                .description(dto.getDescription())
;
        return builder.build();
    }
}