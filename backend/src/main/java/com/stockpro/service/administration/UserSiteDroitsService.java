package com.stockpro.service.administration;

import com.stockpro.dto.administration.UserSiteDroitsDTO;
import com.stockpro.entity.administration.UserSiteDroits;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserSiteDroitsService {
    List<UserSiteDroitsDTO> findAll();
    Page<UserSiteDroitsDTO> findAll(Pageable pageable);
    UserSiteDroitsDTO findById(UUID id);
    List<UserSiteDroitsDTO> findByUserSite(UUID idUtilSite);
    UserSiteDroitsDTO create(UserSiteDroitsDTO userSiteDroits);
    UserSiteDroitsDTO update(UUID id, UserSiteDroitsDTO userSiteDroits);
    void delete(UUID id);
}
