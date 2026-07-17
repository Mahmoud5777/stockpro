package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.UserSite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserSiteService {
    List<UserSite> findAll();
    Page<UserSite> findAll(Pageable pageable);
    UserSite findById(String id);
    List<UserSite> findByUser(String idUtil);
    List<UserSite> findBySite(String idSite);
    UserSite create(UserSite userSite);
    UserSite update(String id, UserSite userSite);
    void delete(String id);
}
