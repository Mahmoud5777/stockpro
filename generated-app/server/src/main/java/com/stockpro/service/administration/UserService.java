package com.stockpro.service.administration;

import com.stockpro.dto.administration.UserDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface UserService {
List<UserDTO> findAll();
    Page<UserDTO> findAll(Pageable pageable);
        Page<UserDTO> findAll(String search, Map<String, String> filters, Pageable pageable);
                        UserDTO findById(UUID id);
                        UserDTO create(UserDTO dto);
                        UserDTO update(UUID id, UserDTO dto);
                        void delete(UUID id);
                        }