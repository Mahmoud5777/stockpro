package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.SiteDTO;
import com.stockpro.entity.administration.Site;
import org.springframework.stereotype.Component;

@Component
public class SiteMapper {

    public SiteDTO toDto(Site entity) {
        if (entity == null) return null;
        return SiteDTO.builder()
                .idSite(entity.getIdSite())
                .codeSite(entity.getCodeSite())
                .nomSite(entity.getNomSite())
                .description(entity.getDescription())
                .address(entity.getAddress())
                .idSiteParent(entity.getSiteParent() != null ? entity.getSiteParent().getIdSite() : null)
                .build();
    }

    public Site toEntity(SiteDTO dto) {
        if (dto == null) return null;
        Site.SiteBuilder builder = Site.builder()
                .idSite(dto.getIdSite())
                .codeSite(dto.getCodeSite())
                .nomSite(dto.getNomSite())
                .description(dto.getDescription())
                .address(dto.getAddress());
        if (dto.getIdSiteParent() != null) {
            builder.siteParent(Site.builder().idSite(dto.getIdSiteParent()).build());
        }
        return builder.build();
    }
}
