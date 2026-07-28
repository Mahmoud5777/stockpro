package com.stockpro.mapper.administration;

import com.stockpro.dto.administration.FonctionnaliteDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.entity.administration.Fonctionnalite;
import org.springframework.stereotype.Component;

@Component
public class FonctionnaliteMapper {

    public FonctionnaliteDTO toDto(Fonctionnalite entity) {
        if (entity == null) return null;
        return FonctionnaliteDTO.builder()
                .idFonc(entity.getIdFonc())
                .codeFonc(entity.getCodeFonc())
                .libelle(entity.getLibelle())
                .description(entity.getDescription())
                .url(entity.getUrl())
                .icone(entity.getIcone())
                .orderAffichage(entity.getOrderAffichage())
                .actif(entity.getActif())
                .idApp(entity.getApplication() != null ? entity.getApplication().getIdApp() : null)
                .idFoncMere(entity.getFonctionMere() != null ? entity.getFonctionMere().getIdFonc() : null)
                .build();
    }

    public Fonctionnalite toEntity(FonctionnaliteDTO dto) {
        if (dto == null) return null;
        Fonctionnalite.FonctionnaliteBuilder builder = Fonctionnalite.builder()
                .idFonc(dto.getIdFonc())
                .codeFonc(dto.getCodeFonc())
                .libelle(dto.getLibelle())
                .description(dto.getDescription())
                .url(dto.getUrl())
                .icone(dto.getIcone())
                .orderAffichage(dto.getOrderAffichage())
                .actif(dto.getActif());

        if (dto.getIdApp() != null) {
            builder.application(Application.builder().idApp(dto.getIdApp()).build());
        }
        if (dto.getIdFoncMere() != null) {
            builder.fonctionMere(Fonctionnalite.builder().idFonc(dto.getIdFoncMere()).build());
        }
        return builder.build();
    }
}
