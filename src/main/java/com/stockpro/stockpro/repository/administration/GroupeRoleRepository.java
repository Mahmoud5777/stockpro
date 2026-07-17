package com.stockpro.stockpro.repository.administration;

import com.stockpro.stockpro.entity.administration.GroupeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupeRoleRepository extends JpaRepository<GroupeRole, String> {
    List<GroupeRole> findByGroupe_IdGr(String idGr);
    List<GroupeRole> findByRole_IdRl(String idRl);
}
