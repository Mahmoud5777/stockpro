package com.stockpro.service.audit;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.entity.audit.LogAcces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    Page<LogAcces> findAll(Pageable pageable);

    Page<LogAcces> search(String login, AuditAction action, Pageable pageable);
}
