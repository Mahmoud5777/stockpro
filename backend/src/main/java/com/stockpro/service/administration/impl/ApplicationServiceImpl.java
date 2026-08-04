package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ApplicationMapper;
import com.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.service.administration.ApplicationService;
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
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDTO> findAll() {
        return applicationRepository.findAll().stream()
                .map(applicationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable).map(applicationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> search(String query, Pageable pageable) {
        return applicationRepository.findByNomAppContainingIgnoreCaseOrCodeAppContainingIgnoreCase(query, query, pageable)
                .map(applicationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDTO findById(UUID id) {
        return applicationMapper.toDto(findEntityById(id));
    }

    @Override
    public ApplicationDTO create(ApplicationDTO applicationDTO) {
        Application application = applicationMapper.toEntity(applicationDTO);
        application.setIdApp(null);
        return applicationMapper.toDto(applicationRepository.save(application));
    }

    @Override
    public ApplicationDTO update(UUID id, ApplicationDTO applicationDTO) {
        Application existing = findEntityById(id);
        existing.setCodeApp(applicationDTO.getCodeApp());
        existing.setNomApp(applicationDTO.getNomApp());
        existing.setDescription(applicationDTO.getDescription());
        existing.setVersion(applicationDTO.getVersion());
        return applicationMapper.toDto(applicationRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        Application existing = findEntityById(id);
        applicationRepository.delete(existing);
    }

    // Recupere l'entite Application ou leve une exception si absente.
    // Reste interne au service : le contrat public ne manipule plus que des DTO.
    private Application findEntityById(UUID id) {
        return applicationRepository.findById(id.toString().replace("-", " "))
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
    }
}
