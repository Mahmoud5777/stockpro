package com.stockpro.mapper.security;

import com.stockpro.dto.security.UserSiteDTO;
import com.stockpro.entity.security.UserSite;
import org.springframework.stereotype.Component;

@Component
public class UserSiteMapper {

    public UserSiteDTO toDto(UserSite entity) {
        if (entity == null) {
            return null;
        }
        UserSiteDTO.UserSiteDTOBuilder builder = UserSiteDTO.builder()
                .id(entity.getId())
                .roleUtilisateur(entity.getRoleUtilisateur())
                .dateAffectation(entity.getDateAffectation())
                .userId(entity.getUser() != null ? entity.getUser().getId() : null)
                .siteId(entity.getSite() != null ? entity.getSite().getId() : null)
;
        return builder.build();
    }

    public UserSite toEntity(UserSiteDTO dto) {
        if (dto == null) {
            return null;
        }
        UserSite.UserSiteBuilder builder = UserSite.builder()
                .id(dto.getId())
                .roleUtilisateur(dto.getRoleUtilisateur())
                .dateAffectation(dto.getDateAffectation())
;
        return builder.build();
    }
}