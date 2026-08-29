package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.EzrefeDTO;
import com.stockpro.entity.administration.Ezrefe;
import org.springframework.stereotype.Component;

@Component
public class EzrefeMapper {

    public EzrefeDTO toDto(Ezrefe entity) {
        if (entity == null) {
            return null;
        }
        EzrefeDTO.EzrefeDTOBuilder builder = EzrefeDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public Ezrefe toEntity(EzrefeDTO dto) {
        if (dto == null) {
            return null;
        }
        Ezrefe.EzrefeBuilder builder = Ezrefe.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}