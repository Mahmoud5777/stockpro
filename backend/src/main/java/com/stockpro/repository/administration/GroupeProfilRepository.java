package com.stockpro.repository.administration;

import com.stockpro.entity.administration.GroupeProfil;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupeProfilRepository extends JpaRepository<GroupeProfil, String> {
    List<GroupeProfil> findByGroupe_IdGr(UUID idGr);
    List<GroupeProfil> findByProfil_IdPr(UUID idPr);
}
