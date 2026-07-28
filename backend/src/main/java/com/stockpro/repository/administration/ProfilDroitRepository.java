package com.stockpro.repository.administration;

import com.stockpro.entity.administration.ProfilDroit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProfilDroitRepository extends JpaRepository<ProfilDroit, String> {
    List<ProfilDroit> findByProfil_IdPr(String idPr);
    List<ProfilDroit> findByFonctionnalite_IdFonc(String idFonc);
}
