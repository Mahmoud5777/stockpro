package com.stockpro.stockpro.service.administration;

import com.stockpro.stockpro.entity.administration.Role;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoleService {
    List<Role> findAll();
    Page<Role> findAll(Pageable pageable);
    Page<Role> search(String query, Pageable pageable);
    Role findById(String id);
    Role create(Role role);
    Role update(String id, Role role);
    void delete(String id);
}
