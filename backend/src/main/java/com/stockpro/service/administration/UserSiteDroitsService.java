package com.stockpro.service.administration;

import com.stockpro.entity.administration.UserSiteDroits;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserSiteDroitsService {
    List<UserSiteDroits> findAll();
    Page<UserSiteDroits> findAll(Pageable pageable);
    UserSiteDroits findById(UUID id);
    List<UserSiteDroits> findByUserSite(UUID idUtilSite);
    UserSiteDroits create(UserSiteDroits userSiteDroits);
    UserSiteDroits update(UUID id, UserSiteDroits userSiteDroits);
    void delete(UUID id);
}
