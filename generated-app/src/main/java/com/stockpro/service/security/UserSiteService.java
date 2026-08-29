package com.stockpro.service.security;

import com.stockpro.dto.security.UserSiteDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserSiteService {
List<UserSiteDTO> findAll();
    Page<UserSiteDTO> findAll(Pageable pageable);
        Page<UserSiteDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        UserSiteDTO findById(UUID id);
                        UserSiteDTO create(UserSiteDTO dto);
                        UserSiteDTO update(UUID id, UserSiteDTO dto);
                        void delete(UUID id);
                        }