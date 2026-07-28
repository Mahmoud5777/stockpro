package com.stockpro.repository.audit;

import com.stockpro.entity.audit.AuditAction;
import com.stockpro.entity.audit.LogAcces;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogAccesRepository extends JpaRepository<LogAcces, String> {

    Page<LogAcces> findByLoginContainingIgnoreCase(String login, Pageable pageable);

    Page<LogAcces> findByAction(AuditAction action, Pageable pageable);

    Page<LogAcces> findByLoginContainingIgnoreCaseAndAction(String login, AuditAction action, Pageable pageable);
}
