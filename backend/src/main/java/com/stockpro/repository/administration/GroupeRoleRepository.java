package com.stockpro.repository.administration;

import com.stockpro.entity.administration.GroupeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupeRoleRepository extends JpaRepository<GroupeRole, String> {
    List<GroupeRole> findByGroupe_IdGr(UUID idGr);
    List<GroupeRole> findByRole_IdRl(UUID idRl);
}
