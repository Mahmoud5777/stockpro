package com.stockpro.service.administration;

import com.stockpro.entity.administration.Role;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RoleService {
    List<Role> findAll();
    Page<Role> findAll(Pageable pageable);
    Page<Role> search(String query, Pageable pageable);
    Role findById(UUID id);
    Role create(Role role);
    Role update(UUID id, Role role);
    void delete(UUID id);
}
