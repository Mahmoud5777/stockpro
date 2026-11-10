package com.stockpro.repository.administration;

import com.stockpro.entity.administration.UserSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserSiteRepository extends JpaRepository<UserSite, UUID> {
    List<UserSite> findByUser_IdUtil(UUID idUtil);
    List<UserSite> findBySite_IdSite(UUID idSite);
}
