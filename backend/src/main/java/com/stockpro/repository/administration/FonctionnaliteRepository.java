package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Fonctionnalite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FonctionnaliteRepository extends JpaRepository<Fonctionnalite, String> {
    Optional<Fonctionnalite> findByCodeFonc(String codeFonc);
    List<Fonctionnalite> findByApplication_IdApp(UUID idApp);
    List<Fonctionnalite> findByFonctionMere_IdFonc(UUID idFoncMere);
    List<Fonctionnalite> findByFonctionMereIsNull();
    org.springframework.data.domain.Page<Fonctionnalite> findByLibelleContainingIgnoreCaseOrCodeFoncContainingIgnoreCase(String libelle, String codeFonc, org.springframework.data.domain.Pageable pageable);
}
