package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.GroupeDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.GroupeMapper;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.service.administration.GroupeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupeServiceImpl implements GroupeService {

    private final GroupeRepository groupeRepository;
    private final GroupeMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeDTO> findAll() {
        return groupeRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeDTO> findAll(Pageable pageable) {
        return groupeRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeDTO> search(String query, Pageable pageable) {
        return groupeRepository
                .findByLibelleContainingIgnoreCaseOrCodeGroupeContainingIgnoreCase(query, query, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    public GroupeDTO create(GroupeDTO dto) {
        Groupe groupe = mapper.toEntity(dto);
        groupe.setIdGr(null);
        return mapper.toDto(groupeRepository.save(groupe));
    }

    @Override
    public GroupeDTO update(UUID id, GroupeDTO dto) {
        Groupe existing = getEntity(id);
        existing.setCodeGroupe(dto.getCodeGroupe());
        existing.setLibelle(dto.getLibelle());
        existing.setDescription(dto.getDescription());
        return mapper.toDto(groupeRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        groupeRepository.delete(getEntity(id));
    }

    private Groupe getEntity(UUID id) {
        return groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", id));
    }
}
