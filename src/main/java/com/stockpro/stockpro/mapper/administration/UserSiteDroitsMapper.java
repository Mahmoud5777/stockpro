package com.stockpro.stockpro.mapper.administration;

import com.stockpro.stockpro.dto.administration.UserSiteDroitsDTO;
import com.stockpro.stockpro.entity.administration.*;
import org.springframework.stereotype.Component;

@Component
public class UserSiteDroitsMapper {

    public UserSiteDroitsDTO toDto(UserSiteDroits entity) {
        if (entity == null) return null;
        return UserSiteDroitsDTO.builder()
                .idUserSiteDroit(entity.getIdUserSiteDroit())
                .idUtilSite(entity.getUserSite() != null ? entity.getUserSite().getIdUtilSite() : null)
                .idRl(entity.getRole() != null ? entity.getRole().getIdRl() : null)
                .idPr(entity.getProfil() != null ? entity.getProfil().getIdPr() : null)
                .idGr(entity.getGroupe() != null ? entity.getGroupe().getIdGr() : null)
                .dateAffectation(entity.getDateAffectation())
                .build();
    }

    public UserSiteDroits toEntity(UserSiteDroitsDTO dto) {
        if (dto == null) return null;
        UserSiteDroits.UserSiteDroitsBuilder builder = UserSiteDroits.builder()
                .idUserSiteDroit(dto.getIdUserSiteDroit())
                .dateAffectation(dto.getDateAffectation());

        if (dto.getIdUtilSite() != null) {
            builder.userSite(UserSite.builder().idUtilSite(dto.getIdUtilSite()).build());
        }
        if (dto.getIdRl() != null) {
            builder.role(Role.builder().idRl(dto.getIdRl()).build());
        }
        if (dto.getIdPr() != null) {
            builder.profil(Profil.builder().idPr(dto.getIdPr()).build());
        }
        if (dto.getIdGr() != null) {
            builder.groupe(Groupe.builder().idGr(dto.getIdGr()).build());
        }
        return builder.build();
    }
}
