package com.stockpro.service.administration;

import com.stockpro.dto.administration.UserSiteDTO;
import com.stockpro.entity.administration.UserSite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserSiteService {
    List<UserSiteDTO> findAll();
    Page<UserSiteDTO> findAll(Pageable pageable);
    UserSiteDTO findById(UUID id);
    List<UserSiteDTO> findByUser(UUID idUtil);
    List<UserSiteDTO> findBySite(UUID idSite);
    UserSiteDTO create(UserSiteDTO userSite);
    UserSiteDTO update(UUID id, UserSiteDTO userSite);
    void delete(UUID id);
}
