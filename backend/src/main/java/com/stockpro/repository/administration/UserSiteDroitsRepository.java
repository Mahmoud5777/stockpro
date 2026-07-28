package com.stockpro.repository.administration;

import com.stockpro.entity.administration.UserSiteDroits;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSiteDroitsRepository extends JpaRepository<UserSiteDroits, String> {
    List<UserSiteDroits> findByUserSite_IdUtilSite(String idUtilSite);
    List<UserSiteDroits> findByRole_IdRl(String idRl);
    List<UserSiteDroits> findByProfil_IdPr(String idPr);
    List<UserSiteDroits> findByGroupe_IdGr(String idGr);
}
