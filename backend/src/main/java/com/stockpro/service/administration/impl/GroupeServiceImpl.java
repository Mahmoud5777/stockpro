package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.GroupeDTO;
import com.stockpro.entity.administration.Groupe;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.GroupeMapper;
import com.stockpro.repository.administration.GroupeRepository;
import com.stockpro.service.administration.GroupeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class GroupeServiceImpl implements GroupeService {

    private final GroupeRepository groupeRepository;
    private final GroupeMapper groupeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GroupeDTO> findAll() {
        return groupeRepository.findAll().stream()
                .map(groupeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeDTO> findAll(Pageable pageable) {
        return groupeRepository.findAll(pageable).map(groupeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupeDTO> search(String query, Pageable pageable) {
        return groupeRepository.findByLibelleContainingIgnoreCaseOrCodeGroupeContainingIgnoreCase(query, query, pageable)
                .map(groupeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public GroupeDTO findById(UUID id) {
        return groupeMapper.toDto(findEntityById(id));
    }

    @Override
    public GroupeDTO create(GroupeDTO groupeDTO) {
        Groupe groupe = groupeMapper.toEntity(groupeDTO);
        groupe.setIdGr(null);
        return groupeMapper.toDto(groupeRepository.save(groupe));
    }

    @Override
    public GroupeDTO update(UUID id, GroupeDTO groupeDTO) {
        Groupe existing = findEntityById(id);
        existing.setCodeGroupe(groupeDTO.getCodeGroupe());
        existing.setLibelle(groupeDTO.getLibelle());
        existing.setDescription(groupeDTO.getDescription());
        return groupeMapper.toDto(groupeRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        Groupe existing = findEntityById(id);
        groupeRepository.delete(existing);
    }

    // Recupere l'entite Groupe ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private Groupe findEntityById(UUID id) {
        return groupeRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Groupe", id));
    }
}
