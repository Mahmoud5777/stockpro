package com.stockpro.mapper.security;

import com.stockpro.dto.security.UserDTO;
import com.stockpro.entity.security.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDto(User entity) {
        if (entity == null) {
            return null;
        }
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .prenom(entity.getPrenom())
                .nom(entity.getNom())
                .estActif(entity.getEstActif())
                .siteId(entity.getSite() != null ? entity.getSite().getId() : null)
;
        return builder.build();
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }
        User.UserBuilder builder = User.builder()
                .id(dto.getId())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .prenom(dto.getPrenom())
                .nom(dto.getNom())
                .estActif(dto.getEstActif())
;
        return builder.build();
    }
}