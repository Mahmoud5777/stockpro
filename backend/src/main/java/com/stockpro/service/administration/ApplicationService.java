package com.stockpro.service.administration;

import com.stockpro.entity.administration.Application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ApplicationService {
    List<Application> findAll();
    Page<Application> findAll(Pageable pageable);
    Page<Application> search(String query, Pageable pageable);
    Application findById(UUID id);
    Application create(Application application);
    Application update(UUID id, Application application);
    void delete(UUID id);
}
