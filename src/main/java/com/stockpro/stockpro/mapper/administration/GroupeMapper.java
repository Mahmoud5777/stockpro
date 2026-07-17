package com.stockpro.stockpro.mapper.administration;

import com.stockpro.stockpro.dto.administration.GroupeDTO;
import com.stockpro.stockpro.entity.administration.Groupe;
import org.springframework.stereotype.Component;

@Component
public class GroupeMapper {

    public GroupeDTO toDto(Groupe entity) {
        if (entity == null) return null;
        return GroupeDTO.builder()
                .idGr(entity.getIdGr())
                .codeGroupe(entity.getCodeGroupe())
                .libelle(entity.getLibelle())
                .description(entity.getDescription())
                .build();
    }

    public Groupe toEntity(GroupeDTO dto) {
        if (dto == null) return null;
        return Groupe.builder()
                .idGr(dto.getIdGr())
                .codeGroupe(dto.getCodeGroupe())
                .libelle(dto.getLibelle())
                .description(dto.getDescription())
                .build();
    }
}
