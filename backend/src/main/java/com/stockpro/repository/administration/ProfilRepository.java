package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Profil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfilRepository extends JpaRepository<Profil, String>, JpaSpecificationExecutor<Profil> {
    Optional<Profil> findByCodeProfil(String codeProfil);
}
