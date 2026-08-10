package com.stockpro.dto.common;

/**
 * Type de traitement appliqué à un filtre déclaré dans une {@link FilterDefinition}.
 * <ul>
 *   <li>TEXT    : correspondance partielle insensible à la casse (LIKE %valeur%)</li>
 *   <li>BOOLEAN : égalité stricte (true / false)</li>
 *   <li>UUID    : égalité stricte sur un identifiant</li>
 *   <li>ENUM    : égalité stricte sur une valeur d'enum (classe fournie via FilterField)</li>
 * </ul>
 */
public enum FilterType {
    TEXT,
    BOOLEAN,
    UUID,
    ENUM
}