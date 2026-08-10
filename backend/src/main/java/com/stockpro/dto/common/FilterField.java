package com.stockpro.dto.common;

/**
 * Déclaration d'un filtre filtrable par le système de recherche universel.
 *
 * @param paramName     nom du paramètre HTTP attendu (ex: "etatCompte", "siteId")
 * @param attributePath chemin d'attribut JPA de l'entité (ex: "etatCompte", "userSites.site.idSite").
 *                      Un chemin en plusieurs segments déclenche automatiquement des JOIN et la
 *                      déduplication (DISTINCT) des résultats.
 * @param type          traitement appliqué à la valeur (voir {@link FilterType})
 * @param enumClass     classe de l'enum uniquement pour {@code type = ENUM}
 */
public record FilterField(
        String paramName,
        String attributePath,
        FilterType type,
        Class<? extends Enum<?>> enumClass) {

    public FilterField(String paramName, String attributePath, FilterType type) {
        this(paramName, attributePath, type, null);
    }
}