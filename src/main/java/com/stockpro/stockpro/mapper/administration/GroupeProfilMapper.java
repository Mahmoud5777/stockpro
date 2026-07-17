package com.stockpro.stockpro.mapper.administration;

import com.stockpro.stockpro.dto.administration.GroupeProfilDTO;
import com.stockpro.stockpro.entity.administration.Groupe;
import com.stockpro.stockpro.entity.administration.GroupeProfil;
import com.stockpro.stockpro.entity.administration.Profil;
import org.springframework.stereotype.Component;

@Component
public class GroupeProfilMapper {

    public GroupeProfilDTO toDto(GroupeProfil entity) {
        if (entity == null) return null;
        return GroupeProfilDTO.builder()
                .idGroupeProfil(entity.getIdGroupeProfil())
                .idGr(entity.getGroupe() != null ? entity.getGroupe().getIdGr() : null)
                .idPr(entity.getProfil() != null ? entity.getProfil().getIdPr() : null)
                .actif(entity.getActif())
                .dateCreation(entity.getDateCreation())
                .build();
    }

    public GroupeProfil toEntity(GroupeProfilDTO dto) {
        if (dto == null) return null;
        return GroupeProfil.builder()
                .idGroupeProfil(dto.getIdGroupeProfil())
                .groupe(dto.getIdGr() != null ? Groupe.builder().idGr(dto.getIdGr()).build() : null)
                .profil(dto.getIdPr() != null ? Profil.builder().idPr(dto.getIdPr()).build() : null)
                .actif(dto.getActif())
                .dateCreation(dto.getDateCreation())
                .build();
    }
}
