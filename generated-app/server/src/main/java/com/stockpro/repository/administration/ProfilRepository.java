package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Profil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfilRepository extends JpaRepository<Profil, UUID> {
    Optional<Profil> findByCodeProfil(String codeProfil);

    Page<Profil> findByLibelleContainingIgnoreCaseOrCodeProfilContainingIgnoreCase(
            String libelle, String codeProfil, Pageable pageable);
}
