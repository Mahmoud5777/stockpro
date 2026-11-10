package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.ProfilDroitDTO;
import com.stockpro.entity.administration.Fonctionnalite;
import com.stockpro.entity.administration.Profil;
import com.stockpro.entity.administration.ProfilDroit;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

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

    public List<ProfilDroitDTO> toDto(List<ProfilDroit> entities) {
        if (entities == null) return null;
        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Page<ProfilDroitDTO> toDto(Page<ProfilDroit> page) {
        if (page == null) return null;
        return page.map(this::toDto);
    }

    public ProfilDroit toEntity(ProfilDroitDTO dto) {
        if (dto == null) return null;
        ProfilDroit.ProfilDroitBuilder builder = ProfilDroit.builder()
                .idProfilDroit(dto.getIdProfilDroit())
                .consultation(dto.getConsultation())
                .ajout(dto.getAjout())
                .suppression(dto.getSuppression())
                .impression(dto.getImpression())
                .export(dto.getExport())
                .modification(dto.getModification());
        if (dto.getIdPr() != null) {
            builder.profil(Profil.builder().idPr(dto.getIdPr()).build());
        }
        if (dto.getIdFonc() != null) {
            builder.fonctionnalite(Fonctionnalite.builder().idFonc(dto.getIdFonc()).build());
        }
        return builder.build();
    }
}
