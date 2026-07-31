package com.stockpro.service.administration;

import com.stockpro.entity.administration.UserSite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserSiteService {
    List<UserSite> findAll();
    Page<UserSite> findAll(Pageable pageable);
    UserSite findById(UUID id);
    List<UserSite> findByUser(UUID idUtil);
    List<UserSite> findBySite(UUID idSite);
    UserSite create(UserSite userSite);
    UserSite update(UUID id, UserSite userSite);
    void delete(UUID id);
}
