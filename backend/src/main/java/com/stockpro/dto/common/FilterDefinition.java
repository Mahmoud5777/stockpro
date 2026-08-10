package com.stockpro.dto.common;

import java.util.List;

/**
 * Définition universelle du système de recherche pour une entité :
 * quels champs sont couverts par la recherche plein texte ({@code search}) et quels
 * filtres supplémentaires peuvent être appliqués (combinaison AND avec la recherche).
 *
 * @param searchFields attributs texte de l'entité cherchés par le paramètre {@code search} (LIKE, insensible à la casse)
 * @param filters      filtres supplémentaires déclarés (param HTTP -> attribut JPA)
 */
public record FilterDefinition(
        List<String> searchFields,
        List<FilterField> filters) {
}