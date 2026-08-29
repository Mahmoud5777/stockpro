package com.stockpro.repository.security;

import com.stockpro.entity.security.UserSiteDroits;
import com.stockpro.entity..Optional;
import com.stockpro.entity..List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSiteDroitsRepository extends JpaRepository<UserSiteDroits, UUID>, JpaSpecificationExecutor<UserSiteDroits> {
    Optional<UserSiteDroits> findByCodeDroit(String codeDroit);
    List<UserSiteDroits> findByRole(UUID roleId);
}