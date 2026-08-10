package com.stockpro.util;

import com.stockpro.dto.common.FilterDefinition;
import com.stockpro.dto.common.FilterField;
import com.stockpro.dto.common.FilterType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Moteur universel de recherche + filtres (JPA Criteria / Specifications).
 * <p>
 * Remplace les requêtes JPQL écrites à la main (ex: ancien findAllWithFilters de UserRepository) :
 * une seule implémentation sert toutes les entités, pilotée par les {@link FilterDefinition}
 * déclarées dans {@code com.stockpro.config.FilterDefinitions}.
 */
public final class EntitySpecifications {

    private EntitySpecifications() {
    }

    /**
     * Point d'entrée unique pour les services : pagine l'entité avec recherche + filtres,
     * ou retourne la liste complète paginée si aucun critère n'est fourni (fast-path).
     */
    public static <T, R extends JpaRepository<T, ?> & JpaSpecificationExecutor<T>> Page<T> findAll(
            R repository,
            FilterDefinition definition,
            String search,
            Map<String, String> filters,
            Pageable pageable) {
        Specification<T> spec = build(definition, search, filters);
        if (spec == null) {
            return repository.findAll(pageable);
        }
        return repository.findAll(spec, pageable);
    }

    /**
     * Construit la Specification à partir de la définition de l'entité, du texte de recherche
     * et des paramètres de filtres reçus. Renvoie {@code null} (aucun critère) si rien à appliquer.
     */
    public static <T> Specification<T> build(
            FilterDefinition definition, String search, Map<String, String> filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            Map<String, Join<?, ?>> joins = new HashMap<>();

            // Recherche plein texte : OR LIKE sur tous les champs déclarés.
            if (search != null && !search.isBlank() && !definition.searchFields().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                List<Predicate> likes = new ArrayList<>();
                for (String field : definition.searchFields()) {
                    @SuppressWarnings("unchecked")
                    Path<String> path = (Path<String>) resolvePath(root, field, joins);
                    likes.add(cb.like(cb.lower(path), pattern));
                }
                predicates.add(cb.or(likes.toArray(new Predicate[0])));
            }

            // Filtres supplémentaires : AND d'égalités sur les seuls paramètres déclarés.
            if (filters != null) {
                for (FilterField filter : definition.filters()) {
                    String raw = filters.get(filter.paramName());
                    if (raw == null || raw.isBlank()) {
                        continue;
                    }
                    Path<?> path = resolvePath(root, filter.attributePath(), joins);
                    Object value = parseValue(filter, raw);
                    if (value != null) {
                        predicates.add(cb.equal(path, value));
                    }
                }
            }

            if (predicates.isEmpty()) {
                return null;
            }

            // DISTINCT dès qu'un JOIN est utilisé (multi-collections → doublons).
            if (!joins.isEmpty() && query.getResultType() != Long.class && query.getResultType() != long.class) {
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Parcourt le chemin d'attribut (ex: "userSites.site.idSite") en créant des JOIN
     * pour chaque relation intermédiaire, puis retourne le Path feuille.
     */
    private static Path<?> resolvePath(Path<?> root, String attributePath, Map<String, Join<?, ?>> joins) {
        String[] segments = attributePath.split("\\.");
        if (segments.length == 1) {
            return root.get(segments[0]);
        }
        Path<?> current = root;
        StringBuilder acc = new StringBuilder();
        for (int i = 0; i < segments.length - 1; i++) {
            if (acc.length() > 0) {
                acc.append('.');
            }
            acc.append(segments[i]);
            Join<?, ?> join = joins.get(acc.toString());
            if (join == null) {
                join = ((jakarta.persistence.criteria.From<?, ?>) current).join(segments[i], JoinType.LEFT);
                joins.put(acc.toString(), join);
            }
            current = join;
        }
        return current.get(segments[segments.length - 1]);
    }

    /**
     * Convertit la valeur texte du paramètre HTTP selon le type déclaré.
     * Renvoie {@code null} si la valeur est invalide (filtre alors ignoré).
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private static Object parseValue(FilterField filter, String raw) {
        try {
            return switch (filter.type()) {
                case TEXT -> raw;
                case BOOLEAN -> Boolean.valueOf(raw);
                case UUID -> UUID.fromString(raw);
                case ENUM -> filter.enumClass() != null
                        ? Enum.valueOf((Class) filter.enumClass(), raw)
                        : null;
            };
        } catch (IllegalArgumentException | NullPointerException e) {
            return null;
        }
    }
}