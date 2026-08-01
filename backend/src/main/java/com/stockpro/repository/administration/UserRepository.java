package com.stockpro.repository.administration;

import com.stockpro.entity.administration.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByLogin(String login);
    Optional<User> findByEmail(String email);

    // Conservé temporairement pour compatibilité
    Page<User> findByNomCompletContainingIgnoreCaseOrLoginContainingIgnoreCase(
            String nomComplet, String login, Pageable pageable);

    /**
     * Recherche + filtres combinés.
     * DISTINCT évite les doublons causés par le JOIN sur userSites.
     * countQuery explicite = pagination Spring Data fiable.
     */
    @Query(value = """
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.userSites us
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(u.nomComplet) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.login) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:etatCompte IS NULL OR u.etatCompte = :etatCompte)
          AND (:siteId IS NULL OR us.site.idSite = :siteId)
        """,
            countQuery = """
        SELECT COUNT(DISTINCT u) FROM User u
        LEFT JOIN u.userSites us
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(u.nomComplet) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(u.login) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:etatCompte IS NULL OR u.etatCompte = :etatCompte)
          AND (:siteId IS NULL OR us.site.idSite = :siteId)
        """)
    Page<User> findAllWithFilters(
            @Param("search") String search,
            @Param("etatCompte") Boolean etatCompte,
            @Param("siteId") UUID siteId,
            Pageable pageable);
}