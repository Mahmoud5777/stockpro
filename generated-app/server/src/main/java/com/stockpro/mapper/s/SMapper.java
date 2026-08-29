package com.stockpro.mapper.s;

import com.stockpro.dto.s.SDTO;
import com.stockpro.entity.s.S;
import org.springframework.stereotype.Component;

@Component
public class SMapper {

    public SDTO toDto(S entity) {
        if (entity == null) {
            return null;
        }
        SDTO.SDTOBuilder builder = SDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public S toEntity(SDTO dto) {
        if (dto == null) {
            return null;
        }
        S.SBuilder builder = S.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}