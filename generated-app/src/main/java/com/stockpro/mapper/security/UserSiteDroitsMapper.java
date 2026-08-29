package com.stockpro.mapper.security;

import com.stockpro.dto.security.UserSiteDroitsDTO;
import com.stockpro.entity.security.UserSiteDroits;
import org.springframework.stereotype.Component;

@Component
public class UserSiteDroitsMapper {

    public UserSiteDroitsDTO toDto(UserSiteDroits entity) {
        if (entity == null) {
            return null;
        }
        UserSiteDroitsDTO.UserSiteDroitsDTOBuilder builder = UserSiteDroitsDTO.builder()
                .id(entity.getId())
                .codeDroit(entity.getCodeDroit())
                .libelleDroit(entity.getLibelleDroit())
                .estExporte(entity.getEstExporte())
                .userSiteId(entity.getUserSite() != null ? entity.getUserSite().getId() : null)
                .roleId(entity.getRole() != null ? entity.getRole().getId() : null)
;
        return builder.build();
    }

    public UserSiteDroits toEntity(UserSiteDroitsDTO dto) {
        if (dto == null) {
            return null;
        }
        UserSiteDroits.UserSiteDroitsBuilder builder = UserSiteDroits.builder()
                .id(dto.getId())
                .codeDroit(dto.getCodeDroit())
                .libelleDroit(dto.getLibelleDroit())
                .estExporte(dto.getEstExporte())
;
        return builder.build();
    }
}