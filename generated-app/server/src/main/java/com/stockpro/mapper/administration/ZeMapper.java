package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.ZeDTO;
import com.stockpro.entity.administration.Ze;
import org.springframework.stereotype.Component;

@Component
public class ZeMapper {

    public ZeDTO toDto(Ze entity) {
        if (entity == null) {
            return null;
        }
        ZeDTO.ZeDTOBuilder builder = ZeDTO.builder()
                .id(entity.getId())
;
        return builder.build();
    }

    public Ze toEntity(ZeDTO dto) {
        if (dto == null) {
            return null;
        }
        Ze.ZeBuilder builder = Ze.builder()
                .id(dto.getId())
;
        return builder.build();
    }
}