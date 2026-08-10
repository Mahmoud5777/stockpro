package com.stockpro.repository.audit;

import com.stockpro.entity.audit.LogAcces;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LogAccesRepository extends JpaRepository<LogAcces, String>, JpaSpecificationExecutor<LogAcces> {
}
