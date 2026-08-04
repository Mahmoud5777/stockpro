package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
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


    public List<UserDTO> toDtoList(List<User> entities) {
        if (entities == null) {
            return List.of(); // or Collections.emptyList()
        }

        return entities.stream()
                .map(this::toDto)
                .toList(); // Java 16+
        // .collect(Collectors.toList()); // if you're on older Java
    }
    public Page<UserDTO> toDtoPage(Page<User> page) {
        if (page == null) {
            return Page.empty();
        }

        return page.map(this::toDto);
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
