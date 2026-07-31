package com.stockpro.repository.administration;

import com.stockpro.entity.administration.ProfilDroit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProfilDroitRepository extends JpaRepository<ProfilDroit, String> {
    List<ProfilDroit> findByProfil_IdPr(UUID idPr);
    List<ProfilDroit> findByFonctionnalite_IdFonc(UUID idFonc);
}
