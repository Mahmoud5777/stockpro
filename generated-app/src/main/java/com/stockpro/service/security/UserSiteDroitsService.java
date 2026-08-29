package com.stockpro.service.security;

import com.stockpro.dto.security.UserSiteDroitsDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserSiteDroitsService {
List<UserSiteDroitsDTO> findAll();
    Page<UserSiteDroitsDTO> findAll(Pageable pageable);
        Page<UserSiteDroitsDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                List<UserSiteDroitsDTO> findAllForExport(String search, Map<String, String> filters);
                        UserSiteDroitsDTO findById(UUID id);
                        UserSiteDroitsDTO create(UserSiteDroitsDTO dto);
                        UserSiteDroitsDTO update(UUID id, UserSiteDroitsDTO dto);
                        void delete(UUID id);
                        }