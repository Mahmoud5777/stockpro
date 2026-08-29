package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.SzDTO;
import com.stockpro.entity.administration.Sz;
import org.springframework.stereotype.Component;

@Component
public class SzMapper {

    public SzDTO toDto(Sz entity) {
        if (entity == null) {
            return null;
        }
        SzDTO.SzDTOBuilder builder = SzDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public Sz toEntity(SzDTO dto) {
        if (dto == null) {
            return null;
        }
        Sz.SzBuilder builder = Sz.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}