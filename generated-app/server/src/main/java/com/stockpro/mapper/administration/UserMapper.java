package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.UserDTO;
import com.stockpro.entity.administration.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDto(User entity) {
        if (entity == null) {
            return null;
        }
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) {
            return null;
        }
        User.UserBuilder builder = User.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}