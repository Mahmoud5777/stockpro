package com.stockpro.service.administration.impl;

import com.stockpro.entity.administration.Groupe;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.service.administration.GroupeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupeServiceImpl implements GroupeService {

    private final GroupeRepository groupeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Groupe> findAll() {
        return groupeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Groupe> findAll(Pageable pageable) {
        return groupeRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Groupe> search(String query, Pageable pageable) {
        return groupeRepository.findByLibelleContainingIgnoreCaseOrCodeGroupeContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Groupe findById(String id) {
        return groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", id));
    }

    @Override
    public Groupe create(Groupe groupe) {
        groupe.setIdGr(null);
        return groupeRepository.save(groupe);
    }

    @Override
    public Groupe update(String id, Groupe groupe) {
        Groupe existing = findById(id);
        existing.setCodeGroupe(groupe.getCodeGroupe());
        existing.setLibelle(groupe.getLibelle());
        existing.setDescription(groupe.getDescription());
        return groupeRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        Groupe existing = findById(id);
        groupeRepository.delete(existing);
    }
}
