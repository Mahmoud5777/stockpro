package com.stockpro.service.administration;

import com.stockpro.entity.administration.Application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ApplicationService {
    List<Application> findAll();
    Page<Application> findAll(Pageable pageable);
    Page<Application> search(String query, Pageable pageable);
    Application findById(String id);
    Application create(Application application);
    Application update(String id, Application application);
    void delete(String id);
}
