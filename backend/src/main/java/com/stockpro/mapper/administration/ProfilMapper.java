package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.ProfilDTO;
import com.stockpro.entity.administration.Profil;
import org.springframework.stereotype.Component;

@Component
public class ProfilMapper {

    public ProfilDTO toDto(Profil entity) {
        if (entity == null) return null;
        return ProfilDTO.builder()
                .idPr(entity.getIdPr())
                .codeProfil(entity.getCodeProfil())
                .libelle(entity.getLibelle())
                .description(entity.getDescription())
                .build();
    }

    public Profil toEntity(ProfilDTO dto) {
        if (dto == null) return null;
        return Profil.builder()
                .idPr(dto.getIdPr())
                .codeProfil(dto.getCodeProfil())
                .libelle(dto.getLibelle())
                .description(dto.getDescription())
                .build();
    }
}
