package com.stockpro.stockpro.service.administration.impl;

import com.stockpro.stockpro.entity.administration.Application;
import com.stockpro.stockpro.exception.ResourceNotFoundException;
import com.stockpro.stockpro.repository.administration.ApplicationRepository;
import com.stockpro.stockpro.service.administration.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Application> findAll() {
        return applicationRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Application> findAll(Pageable pageable) {
        return applicationRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Application> search(String query, Pageable pageable) {
        return applicationRepository.findByNomAppContainingIgnoreCaseOrCodeAppContainingIgnoreCase(query, query, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Application findById(String id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", id));
    }

    @Override
    public Application create(Application application) {
        application.setIdApp(null);
        return applicationRepository.save(application);
    }

    @Override
    public Application update(String id, Application application) {
        Application existing = findById(id);
        existing.setCodeApp(application.getCodeApp());
        existing.setNomApp(application.getNomApp());
        existing.setDescription(application.getDescription());
        existing.setVersion(application.getVersion());
        return applicationRepository.save(existing);
    }

    @Override
    public void delete(String id) {
        Application existing = findById(id);
        applicationRepository.delete(existing);
    }
}
