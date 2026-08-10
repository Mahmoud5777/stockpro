package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe, String>, JpaSpecificationExecutor<Groupe> {
    Optional<Groupe> findByCodeGroupe(String codeGroupe);
}
