package com.stockpro.stockpro.mapper.administration;

import com.stockpro.stockpro.dto.administration.ProfilDroitDTO;
import com.stockpro.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.stockpro.entity.administration.Profil;
import com.stockpro.stockpro.entity.administration.ProfilDroit;
import org.springframework.stereotype.Component;

@Component
public class ProfilDroitMapper {

    public ProfilDroitDTO toDto(ProfilDroit entity) {
        if (entity == null) return null;
        return ProfilDroitDTO.builder()
                .idProfilDroit(entity.getIdProfilDroit())
                .idPr(entity.getProfil() != null ? entity.getProfil().getIdPr() : null)
                .idFonc(entity.getFonctionnalite() != null ? entity.getFonctionnalite().getIdFonc() : null)
                .consultation(entity.getConsultation())
                .ajout(entity.getAjout())
                .suppression(entity.getSuppression())
                .impression(entity.getImpression())
                .export(entity.getExport())
                .modification(entity.getModification())
                .build();
    }

    public ProfilDroit toEntity(ProfilDroitDTO dto) {
        if (dto == null) return null;
        return ProfilDroit.builder()
                .idProfilDroit(dto.getIdProfilDroit())
                .profil(dto.getIdPr() != null ? Profil.builder().idPr(dto.getIdPr()).build() : null)
                .fonctionnalite(dto.getIdFonc() != null ? Fonctionnalite.builder().idFonc(dto.getIdFonc()).build() : null)
                .consultation(dto.getConsultation())
                .ajout(dto.getAjout())
                .suppression(dto.getSuppression())
                .impression(dto.getImpression())
                .export(dto.getExport())
                .modification(dto.getModification())
                .build();
    }
}
