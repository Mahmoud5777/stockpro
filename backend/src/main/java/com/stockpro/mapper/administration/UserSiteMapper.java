package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.UserSiteDTO;
import com.stockpro.entity.administration.Site;
import com.stockpro.entity.administration.User;
import com.stockpro.entity.administration.UserSite;
import org.springframework.stereotype.Component;

@Component
public class UserSiteMapper {

    public UserSiteDTO toDto(UserSite entity) {
        if (entity == null) return null;
        return UserSiteDTO.builder()
                .idUtilSite(entity.getIdUtilSite())
                .idUtil(entity.getUser() != null ? entity.getUser().getIdUtil() : null)
                .idSite(entity.getSite() != null ? entity.getSite().getIdSite() : null)
                .dateAffectation(entity.getDateAffectation())
                .build();
    }

    public UserSite toEntity(UserSiteDTO dto) {
        if (dto == null) return null;
        return UserSite.builder()
                .idUtilSite(dto.getIdUtilSite())
                .user(dto.getIdUtil() != null ? User.builder().idUtil(dto.getIdUtil()).build() : null)
                .site(dto.getIdSite() != null ? Site.builder().idSite(dto.getIdSite()).build() : null)
                .dateAffectation(dto.getDateAffectation())
                .build();
    }
}
