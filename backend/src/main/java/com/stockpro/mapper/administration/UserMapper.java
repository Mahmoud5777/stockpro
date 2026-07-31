package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class UserMapper {

    public UserDTO toDto(User entity) {
        if (entity == null) return null;
        return UserDTO.builder()
                .idUtil(entity.getIdUtil())
                .nomComplet(entity.getNomComplet())
                .login(entity.getLogin())
                .email(entity.getEmail())
                .telephone(entity.getTelephone())
                .etatCompte(entity.getEtatCompte())
                .dateCreation(entity.getDateCreation())
                .build();
        // motPasse volontairement absent : jamais renvoyé au client
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) return null;
        return User.builder()
                .idUtil(UUID.fromString(dto.getIdUtil().toString().replace("-", " ")))
                .nomComplet(dto.getNomComplet())
                .login(dto.getLogin())
                .motPasse(dto.getMotPasse())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .etatCompte(dto.getEtatCompte())
                .dateCreation(dto.getDateCreation())
                .build();
    }
}
