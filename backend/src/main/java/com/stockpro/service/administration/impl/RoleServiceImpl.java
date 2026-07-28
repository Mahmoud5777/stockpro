package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Role;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.RoleRepository;
import com.stockpro.service.administration.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Role> findAll(Pageable pageable) {
        return roleRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Role> search(String query, Pageable pageable) {
        return roleRepository.findByLibelleContainingIgnoreCaseOrCodeRoleContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Role findById(String id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }

    @Override
    public Role create(Role role) {
        role.setIdRl(null);
        return roleRepository.save(role);
    }

    @Override
    public Role update(String id, Role role) {
        Role existing = findById(id);
        existing.setCodeRole(role.getCodeRole());
        existing.setLibelle(role.getLibelle());
        existing.setDescription(role.getDescription());
        return roleRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        Role existing = findById(id);
        roleRepository.delete(existing);
    }
}
