package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    Optional<Application> findByCodeApp(String codeApp);

    Page<Application> findByNomAppContainingIgnoreCaseOrCodeAppContainingIgnoreCase(
            String nomApp, String codeApp, Pageable pageable);
}               






































