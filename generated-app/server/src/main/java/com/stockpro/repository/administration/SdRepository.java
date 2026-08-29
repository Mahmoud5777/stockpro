package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Sd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SdRepository extends JpaRepository<Sd, UUID>, JpaSpecificationExecutor<Sd> {
}