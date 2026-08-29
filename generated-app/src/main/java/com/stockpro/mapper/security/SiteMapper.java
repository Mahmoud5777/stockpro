package com.stockpro.mapper.security;

import com.stockpro.dto.security.SiteDTO;
import com.stockpro.entity.security.Site;
import org.springframework.stereotype.Component;

@Component
public class SiteMapper {

    public SiteDTO toDto(Site entity) {
        if (entity == null) {
            return null;
        }
        SiteDTO.SiteDTOBuilder builder = SiteDTO.builder()
                .id(entity.getId())
                .nom(entity.getNom())
                .code(entity.getCode())
                .description(entity.getDescription())
;
        return builder.build();
    }

    public Site toEntity(SiteDTO dto) {
        if (dto == null) {
            return null;
        }
        Site.SiteBuilder builder = Site.builder()
                .id(dto.getId())
                .nom(dto.getNom())
                .code(dto.getCode())
                .description(dto.getDescription())
;
        return builder.build();
    }
}