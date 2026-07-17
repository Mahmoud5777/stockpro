package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.UserSiteDroits;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserSiteDroitsService {
    List<UserSiteDroits> findAll();
    Page<UserSiteDroits> findAll(Pageable pageable);
    UserSiteDroits findById(String id);
    List<UserSiteDroits> findByUserSite(String idUtilSite);
    UserSiteDroits create(UserSiteDroits userSiteDroits);
    UserSiteDroits update(String id, UserSiteDroits userSiteDroits);
    void delete(String id);
}
