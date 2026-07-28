package com.stockpro.repository.administration;

import com.stockpro.entity.administration.UserSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSiteRepository extends JpaRepository<UserSite, String> {
    List<UserSite> findByUser_IdUtil(String idUtil);
    List<UserSite> findBySite_IdSite(String idSite);
}
