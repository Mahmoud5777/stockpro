package com.stockpro.service.audit.impl;

import com.stockpro.config.FilterDefinitions;
import com.stockpro.entity.audit.LogAcces;
import com.stockpro.repository.audit.LogAccesRepository;
import com.stockpro.service.audit.AuditLogService;
import com.stockpro.util.EntitySpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogServiceImpl implements AuditLogService {

    private final LogAccesRepository logAccesRepository;

    @Override
    public Page<LogAcces> findAll(Pageable pageable) {
        return logAccesRepository.findAll(pageable);
    }

    @Override
    public Page<LogAcces> findAll(String search, Map<String, String> filters, Pageable pageable) {
        return EntitySpecifications.findAll(logAccesRepository, FilterDefinitions.LOG_ACCES, search, filters, pageable);
    }

    @Override
    public List<LogAcces> findAllForExport(String search, Map<String, String> filters) {
        return EntitySpecifications.findAllList(logAccesRepository, FilterDefinitions.LOG_ACCES, search, filters,
                Sort.by(Sort.Direction.DESC, "dateAcces"));
    }
}
