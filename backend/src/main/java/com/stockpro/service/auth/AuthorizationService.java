package com.stockpro.service.auth;

import com.stockpro.dto.auth.DroitsDTO;
import com.stockpro.dto.auth.FonctionnaliteAvecDroitsDTO;
import com.stockpro.dto.auth.SiteAllegeDTO;
import com.stockpro.entity.administration.*;
import com.stockpro.repository.administration.GroupeProfilRepository;
import com.stockpro.repository.administration.ProfilDroitRepository;
import com.stockpro.repository.administration.UserRepository;
import com.stockpro.repository.administration.UserSiteDroitsRepository;
import com.stockpro.entity.administration.*;
import com.stockpro.repository.administration.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Calcule les droits effectifs d'un utilisateur, conformément au MCD :
 * Utilisateur -[Possede]-> UserSite -[DisposeDe]-> UserSiteDroits
 * -[AffecteProfil]-> Profil (direct) OU -[AffecteGroupe]-> Groupe -[ContientProfil]-> Profil
 * -[PossedeDroit]-> ProfilDroit -[Concerne]-> Fonctionnalite
 * <p>
 * Un utilisateur peut avoir plusieurs sites, donc potentiellement plusieurs jeux de droits :
 * on fusionne (OR logique) tous les droits obtenus sur tous ses sites, fonctionnalité par
 * fonctionnalité. (Les rôles (ID_RL) qualifient une action métier mais ne portent pas de
 * droit d'accès aux fonctionnalités dans ce MCD — seuls les profils en portent.)
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;
    private final UserSiteDroitsRepository userSiteDroitsRepository;
    private final GroupeProfilRepository groupeProfilRepository;
    private final ProfilDroitRepository profilDroitRepository;

    @Transactional(readOnly = true)
    public List<SiteAllegeDTO> resolveSites(UUID idUtil) {
        User user = userRepository.findById(idUtil).orElseThrow();
        return user.getUserSites().stream()
                .map(UserSite::getSite)
                .filter(Objects::nonNull)
                .map(site -> SiteAllegeDTO.builder().idSite(site.getIdSite()).libSite(site.getNomSite()).build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FonctionnaliteAvecDroitsDTO> resolveFonctionnalites(UUID idUtil) {
        User user = userRepository.findById(idUtil).orElseThrow();

        // 1. Collecter tous les profils applicables à l'utilisateur (tous sites confondus) :
        //    directement affectés, ou portés par un groupe affecté.
        Map<String, Profil> profilsApplicables = new LinkedHashMap<>();
        for (UserSite userSite : user.getUserSites()) {
            List<UserSiteDroits> droits = userSiteDroitsRepository.findByUserSite_IdUtilSite(userSite.getIdUtilSite());
            for (UserSiteDroits d : droits) {
                if (d.getProfil() != null) {
                    profilsApplicables.put(d.getProfil().getIdPr().toString().replace("-", " "), d.getProfil());
                }
                if (d.getGroupe() != null) {
                    for (GroupeProfil gp : groupeProfilRepository.findByGroupe_IdGr(d.getGroupe().getIdGr())) {
                        if (Boolean.TRUE.equals(gp.getActif()) && gp.getProfil() != null) {
                            profilsApplicables.put(gp.getProfil().getIdPr().toString().replace("-", " "), gp.getProfil());
                        }
                    }
                }
            }
        }

        // 2. Pour chaque profil, récupérer ses droits par fonctionnalité, et fusionner
        //    (OR logique) si plusieurs profils donnent des droits sur la même fonctionnalité.
        Map<String, FonctionnaliteAvecDroitsDTO> merged = new LinkedHashMap<>();
        for (Profil profil : profilsApplicables.values()) {
            for (ProfilDroit pd : profilDroitRepository.findByProfil_IdPr(profil.getIdPr())) {
                Fonctionnalite f = pd.getFonctionnalite();
                if (f == null) continue;

                FonctionnaliteAvecDroitsDTO existing = merged.get(f.getIdFonc());
                DroitsDTO nouveauxDroits = DroitsDTO.builder()
                        .consultation(Boolean.TRUE.equals(pd.getConsultation()))
                        .ajout(Boolean.TRUE.equals(pd.getAjout()))
                        .modification(Boolean.TRUE.equals(pd.getModification()))
                        .suppression(Boolean.TRUE.equals(pd.getSuppression()))
                        .export(Boolean.TRUE.equals(pd.getExport()))
                        .impression(Boolean.TRUE.equals(pd.getImpression()))
                        .build();

                if (existing == null) {
                    merged.put(f.getIdFonc().toString().replace("-", " "), FonctionnaliteAvecDroitsDTO.builder()
                            .idFonctionnalite(f.getIdFonc())
                            .codFonctionnalite(f.getCodeFonc())
                            .libFonctionnalite(f.getLibelle())
                            .description(f.getDescription())
                            .url(f.getUrl())
                            .icone(f.getIcone())
                            .orderAffichage(f.getOrderAffichage())
                            .actif(Boolean.TRUE.equals(f.getActif()))
                            .idApplication(f.getApplication() != null ? f.getApplication().getIdApp() : null)
                            .parentIdFonctionnalite(f.getFonctionMere() != null ? f.getFonctionMere().getIdFonc() : null)
                            .droits(nouveauxDroits)
                            .build());
                } else {
                    existing.setDroits(orDroits(existing.getDroits(), nouveauxDroits));
                }
            }
        }

        return new ArrayList<>(merged.values());
    }

    private DroitsDTO orDroits(DroitsDTO a, DroitsDTO b) {
        return DroitsDTO.builder()
                .consultation(a.isConsultation() || b.isConsultation())
                .ajout(a.isAjout() || b.isAjout())
                .modification(a.isModification() || b.isModification())
                .suppression(a.isSuppression() || b.isSuppression())
                .export(a.isExport() || b.isExport())
                .impression(a.isImpression() || b.isImpression())
                .build();
    }
}
