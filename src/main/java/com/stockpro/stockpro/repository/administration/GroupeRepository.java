package com.stockpro.stockpro.repository.administration;

import com.stockpro.stockpro.entity.administration.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe, String> {
    Optional<Groupe> findByCodeGroupe(String codeGroupe);
    org.springframework.data.domain.Page<Groupe> findByLibelleContainingIgnoreCaseOrCodeGroupeContainingIgnoreCase(String libelle, String codeGroupe, org.springframework.data.domain.Pageable pageable);
}
