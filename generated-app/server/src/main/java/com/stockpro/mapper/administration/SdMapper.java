package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.SdDTO;
import com.stockpro.entity.administration.Sd;
import org.springframework.stereotype.Component;

@Component
public class SdMapper {

    public SdDTO toDto(Sd entity) {
        if (entity == null) {
            return null;
        }
        SdDTO.SdDTOBuilder builder = SdDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public Sd toEntity(SdDTO dto) {
        if (dto == null) {
            return null;
        }
        Sd.SdBuilder builder = Sd.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}