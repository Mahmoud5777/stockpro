package com.stockpro.service.audit;

import com.stockpro.entity.audit.LogAcces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AuditLogService {

    Page<LogAcces> findAll(Pageable pageable);

    Page<LogAcces> findAll(String search, Map<String, String> filters, Pageable pageable);
}
