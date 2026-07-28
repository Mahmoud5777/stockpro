package com.stockpro.service.audit.impl;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.entity.audit.LogAcces;
import com.stockpro.repository.audit.LogAccesRepository;
import com.stockpro.service.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public Page<LogAcces> search(String login, AuditAction action, Pageable pageable) {
        if (login != null && !login.isBlank() && action != null) {
            return logAccesRepository.findByLoginContainingIgnoreCaseAndAction(login, action, pageable);
        }
        if (login != null && !login.isBlank()) {
            return logAccesRepository.findByLoginContainingIgnoreCase(login, pageable);
        }
        if (action != null) {
            return logAccesRepository.findByAction(action, pageable);
        }
        return logAccesRepository.findAll(pageable);
    }
}
