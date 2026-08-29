package com.stockpro.repository.administration;

import com.stockpro.entity.administration.Erzr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ErzrRepository extends JpaRepository<Erzr, UUID>, JpaSpecificationExecutor<Erzr> {
}