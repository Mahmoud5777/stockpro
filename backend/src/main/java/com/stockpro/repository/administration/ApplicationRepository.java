package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, String> {
    Optional<Application> findByCodeApp(String codeApp);
    org.springframework.data.domain.Page<Application> findByNomAppContainingIgnoreCaseOrCodeAppContainingIgnoreCase(String nomApp, String codeApp, org.springframework.data.domain.Pageable pageable);
}
