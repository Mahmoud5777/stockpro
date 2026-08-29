package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.ErzrDTO;
import com.stockpro.entity.administration.Erzr;
import org.springframework.stereotype.Component;

@Component
public class ErzrMapper {

    public ErzrDTO toDto(Erzr entity) {
        if (entity == null) {
            return null;
        }
        ErzrDTO.ErzrDTOBuilder builder = ErzrDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public Erzr toEntity(ErzrDTO dto) {
        if (dto == null) {
            return null;
        }
        Erzr.ErzrBuilder builder = Erzr.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}