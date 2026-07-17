package com.stockpro.stockpro.mapper.administration;

import com.stockpro.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.stockpro.entity.administration.Application;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationDTO toDto(Application entity) {
        if (entity == null) return null;
        return ApplicationDTO.builder()
                .idApp(entity.getIdApp())
                .codeApp(entity.getCodeApp())
                .nomApp(entity.getNomApp())
                .description(entity.getDescription())
                .version(entity.getVersion())
                .build();
    }

    public Application toEntity(ApplicationDTO dto) {
        if (dto == null) return null;
        return Application.builder()
                .idApp(dto.getIdApp())
                .codeApp(dto.getCodeApp())
                .nomApp(dto.getNomApp())
                .description(dto.getDescription())
                .version(dto.getVersion())
                .build();
    }
}
