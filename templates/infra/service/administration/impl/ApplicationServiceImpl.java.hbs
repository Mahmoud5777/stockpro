package com.stockpro.service.administration.impl;

import com.stockpro.dto.administration.ApplicationDTO;
import com.stockpro.entity.administration.Application;
import com.stockpro.exception.ResourceNotFoundException;
import com.stockpro.mapper.administration.ApplicationMapper;
import com.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.service.administration.ApplicationService;
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
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationDTO> findAll() {
        return applicationRepository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable).map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationDTO> search(String query, Pageable pageable) {
        return applicationRepository
                .findByNomAppContainingIgnoreCaseOrCodeAppContainingIgnoreCase(query, query, pageable)
                .map(mapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDTO findById(UUID id) {
        return mapper.toDto(getEntity(id));
    }

    @Override
    public ApplicationDTO create(ApplicationDTO dto) {
        Application application = mapper.toEntity(dto);
        application.setIdApp(null);
        return mapper.toDto(applicationRepository.save(application));
    }

    @Override
    public ApplicationDTO update(UUID id, ApplicationDTO dto) {
        Application existing = getEntity(id);
        existing.setCodeApp(dto.getCodeApp());
        existing.setNomApp(dto.getNomApp());
        existing.setDescription(dto.getDescription());
        existing.setVersion(dto.getVersion());
        return mapper.toDto(applicationRepository.save(existing));
    }

    @Override
    public void delete(UUID id) {
        applicationRepository.delete(getEntity(id));
    }

    private Application getEntity(UUID id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
    }
}
