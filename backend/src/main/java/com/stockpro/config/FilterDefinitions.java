package com.stockpro.config;

import com.stockpro.dto.common.FilterDefinition;
import com.stockpro.dto.common.FilterField;
import com.stockpro.dto.common.FilterType;

import java.util.List;

/**
 * Registre central des définitions de recherche/filtres pour chaque entité.
 * <p>
 * C'est la seule table à faire évoluer pour rendre un nouveau module filtrable :
 * ajouter ici une définition, brancher JpaSpecificationExecutor sur le repository
 * et appeler {@code EntitySpecifications.findAll(...)} dans le service.
 */
public final class FilterDefinitions {

    private FilterDefinitions() {
    }

    public static final FilterDefinition UTILISATEUR = new FilterDefinition(
            List.of("nomComplet", "login", "email", "telephone"),
            List.of(
                    new FilterField("etatCompte", "etatCompte", FilterType.BOOLEAN),
                    new FilterField("siteId", "userSites.site.idSite", FilterType.UUID)));

    public static final FilterDefinition ROLE = new FilterDefinition(
            List.of("libelle", "codeRole", "description"),
            List.of());

    public static final FilterDefinition SITE = new FilterDefinition(
            List.of("nomSite", "codeSite", "address"),
            List.of());

    public static final FilterDefinition GROUPE = new FilterDefinition(
            List.of("libelle", "codeGroupe", "description"),
            List.of());

    public static final FilterDefinition PROFIL = new FilterDefinition(
            List.of("libelle", "codeProfil", "description"),
            List.of());

    public static final FilterDefinition FONCTIONNALITE = new FilterDefinition(
            List.of("libelle", "codeFonc", "description"),
            List.of(new FilterField("applicationId", "application.idApp", FilterType.UUID)));

    public static final FilterDefinition LOG_ACCES = new FilterDefinition(
            List.of("login", "endpoint", "adresseIp"),
            List.of(new FilterField("action", "action", FilterType.ENUM, com.stockpro.entity.audit.AuditAction.class)));
}