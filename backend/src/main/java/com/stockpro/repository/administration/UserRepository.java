package com.stockpro.repository.administration;

import com.stockpro.entity.administration.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
//import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByLogin(String login);
    Optional<User> findByEmail(String email);




    org.springframework.data.domain.Page<User> findByNomCompletContainingIgnoreCaseOrLoginContainingIgnoreCase(String nomComplet, String login, org.springframework.data.domain.Pageable pageable);
}
