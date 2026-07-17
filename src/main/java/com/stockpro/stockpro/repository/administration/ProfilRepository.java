package com.stockpro.stockpro.repository.administration;

import com.stockpro.stockpro.entity.administration.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfilRepository extends JpaRepository<Profil, String> {
    Optional<Profil> findByCodeProfil(String codeProfil);
    org.springframework.data.domain.Page<Profil> findByLibelleContainingIgnoreCaseOrCodeProfilContainingIgnoreCase(String libelle, String codeProfil, org.springframework.data.domain.Pageable pageable);
}
