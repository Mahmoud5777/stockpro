#!/usr/bin/env node
/**
 * stockpro backend generator — v0
 *
 * Usage:
 *   node generate.js <schema.json | schemas-dir> <output-dir> [options]
 *
 * Examples:
 *   node generate.js schemas/role.json ./output
 *   node generate.js schemas ./output --force
 *   node generate.js schemas ./output --dry-run
 */
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const validateModule = require("./validate");

Handlebars.registerHelper("eq", (left, right) => left === right);
Handlebars.registerHelper("ne", (left, right) => left !== right);
Handlebars.registerHelper("lowerFirst", (value) => value.charAt(0).toLowerCase() + value.slice(1));
Handlebars.registerHelper("capitalize", (value) => value.charAt(0).toUpperCase() + value.slice(1));
Handlebars.registerHelper("json", (value) => JSON.stringify(value));

const TEMPLATES_DIR = path.join(__dirname, "templates");
const VALID_ID_TYPES = ["UUID", "String", "Long"];
const REQUIRED_ENTITY_FIELDS = [
  "module",
  "name",
  "tableName",
  "idField",
  "idColumn",
  "urlPath",
];

function isValidIdType(value) {
  return VALID_ID_TYPES.includes(value);
}

function getIdTypeDefault(entity) {
  return entity.idType || "UUID";
}

// Maps each template to where its rendered output belongs, relative to
// <output-dir>/src/main/java/com/stockpro/. This mirrors stockpro-yacine's
// existing package layout (entity/dto/repository/service/service.impl/mapper/controller).
const LAYERS = [
  { template: "entity.hbs", outPath: (e) => `entity/${e.module}/${e.name}.java` },
  { template: "dto.hbs", outPath: (e) => `dto/${e.module}/${e.name}DTO.java` },
  { template: "repository.hbs", outPath: (e) => `repository/${e.module}/${e.name}Repository.java` },
  { template: "service.hbs", outPath: (e) => `service/${e.module}/${e.name}Service.java` },
  { template: "service-impl.hbs", outPath: (e) => `service/${e.module}/impl/${e.name}ServiceImpl.java` },
  { template: "mapper.hbs", outPath: (e) => `mapper/${e.module}/${e.name}Mapper.java` },
  { template: "controller.hbs", outPath: (e) => `controller/${e.module}/${e.name}Controller.java` },
];

// Fixed infrastructure that makes the generated app bootable and secure: build file,
// Spring Boot bootstrap, JWT security, exceptions, the auth domain (User/Role/RefreshToken)
// and the /api/auth endpoints. These are emitted for every backend/"both" target.
const CORE_LAYERS = [
  { template: "infra/pom.xml.hbs", outPath: () => "pom.xml" },
  { template: "infra/application.yml.hbs", outPath: () => "src/main/resources/application.yml" },
  { template: "infra/StockproApplication.java.hbs", outPath: () => "src/main/java/com/stockpro/StockproApplication.java" },
  { template: "infra/security/SecurityConfig.java.hbs", outPath: () => "src/main/java/com/stockpro/security/SecurityConfig.java" },
  { template: "infra/security/JwtService.java.hbs", outPath: () => "src/main/java/com/stockpro/security/JwtService.java" },
  { template: "infra/security/JwtAuthenticationFilter.java.hbs", outPath: () => "src/main/java/com/stockpro/security/JwtAuthenticationFilter.java" },
  { template: "infra/security/UserDetailsServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/security/UserDetailsServiceImpl.java" },
  { template: "infra/security/AccessGuard.java.hbs", outPath: () => "src/main/java/com/stockpro/security/AccessGuard.java" },
  { template: "infra/security/DataInitializer.java.hbs", outPath: () => "src/main/java/com/stockpro/security/DataInitializer.java" },
  { template: "infra/dto/common/PageResponseDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/common/PageResponseDTO.java" },
  { template: "infra/exception/GlobalExceptionHandler.java.hbs", outPath: () => "src/main/java/com/stockpro/exception/GlobalExceptionHandler.java" },
  { template: "infra/exception/ResourceNotFoundException.java.hbs", outPath: () => "src/main/java/com/stockpro/exception/ResourceNotFoundException.java" },
  { template: "infra/exception/TokenRefreshException.java.hbs", outPath: () => "src/main/java/com/stockpro/exception/TokenRefreshException.java" },
  { template: "infra/entity/administration/User.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/User.java" },
  { template: "infra/entity/administration/Role.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Role.java" },
  { template: "infra/entity/administration/RefreshToken.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/RefreshToken.java" },
  { template: "infra/entity/administration/Site.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Site.java" },
  { template: "infra/entity/administration/Groupe.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Groupe.java" },
  { template: "infra/entity/administration/Profil.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Profil.java" },
  { template: "infra/entity/administration/Application.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Application.java" },
  { template: "infra/entity/administration/Fonctionnalite.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/Fonctionnalite.java" },
  { template: "infra/entity/administration/UserSite.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/UserSite.java" },
  { template: "infra/entity/administration/UserSiteDroits.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/UserSiteDroits.java" },
  { template: "infra/entity/administration/GroupeRole.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/GroupeRole.java" },
  { template: "infra/entity/administration/GroupeProfil.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/GroupeProfil.java" },
  { template: "infra/entity/administration/ProfilDroit.java.hbs", outPath: () => "src/main/java/com/stockpro/entity/administration/ProfilDroit.java" },
  { template: "infra/repository/administration/UserRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/UserRepository.java" },
  { template: "infra/repository/administration/RoleRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/RoleRepository.java" },
  { template: "infra/repository/administration/RefreshTokenRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/RefreshTokenRepository.java" },
  { template: "infra/repository/administration/SiteRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/SiteRepository.java" },
  { template: "infra/repository/administration/GroupeRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/GroupeRepository.java" },
  { template: "infra/repository/administration/ProfilRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/ProfilRepository.java" },
  { template: "infra/repository/administration/ApplicationRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/ApplicationRepository.java" },
  { template: "infra/repository/administration/FonctionnaliteRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/FonctionnaliteRepository.java" },
  { template: "infra/repository/administration/UserSiteRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/UserSiteRepository.java" },
  { template: "infra/repository/administration/UserSiteDroitsRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/UserSiteDroitsRepository.java" },
  { template: "infra/repository/administration/GroupeRoleRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/GroupeRoleRepository.java" },
  { template: "infra/repository/administration/GroupeProfilRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/GroupeProfilRepository.java" },
  { template: "infra/repository/administration/ProfilDroitRepository.java.hbs", outPath: () => "src/main/java/com/stockpro/repository/administration/ProfilDroitRepository.java" },
  { template: "infra/service/administration/RefreshTokenService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/RefreshTokenService.java" },
  { template: "infra/service/administration/impl/RefreshTokenServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/RefreshTokenServiceImpl.java" },
  { template: "infra/dto/administration/UserDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/UserDTO.java" },
  { template: "infra/dto/administration/RoleDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/RoleDTO.java" },
  { template: "infra/dto/administration/SiteDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/SiteDTO.java" },
  { template: "infra/dto/administration/GroupeDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/GroupeDTO.java" },
  { template: "infra/dto/administration/ProfilDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/ProfilDTO.java" },
  { template: "infra/dto/administration/ApplicationDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/ApplicationDTO.java" },
  { template: "infra/dto/administration/FonctionnaliteDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/FonctionnaliteDTO.java" },
  { template: "infra/dto/administration/UserSiteDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/UserSiteDTO.java" },
  { template: "infra/dto/administration/UserSiteDroitsDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/UserSiteDroitsDTO.java" },
  { template: "infra/dto/administration/GroupeRoleDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/GroupeRoleDTO.java" },
  { template: "infra/dto/administration/GroupeProfilDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/GroupeProfilDTO.java" },
  { template: "infra/dto/administration/ProfilDroitDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/administration/ProfilDroitDTO.java" },
  { template: "infra/dto/auth/DroitsDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/DroitsDTO.java" },
  { template: "infra/dto/auth/FonctionnaliteAvecDroitsDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/FonctionnaliteAvecDroitsDTO.java" },
  { template: "infra/dto/auth/SiteAllegeDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/SiteAllegeDTO.java" },
  { template: "infra/mapper/administration/UserMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/UserMapper.java" },
  { template: "infra/mapper/administration/RoleMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/RoleMapper.java" },
  { template: "infra/mapper/administration/SiteMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/SiteMapper.java" },
  { template: "infra/mapper/administration/GroupeMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/GroupeMapper.java" },
  { template: "infra/mapper/administration/ProfilMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/ProfilMapper.java" },
  { template: "infra/mapper/administration/ApplicationMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/ApplicationMapper.java" },
  { template: "infra/mapper/administration/FonctionnaliteMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/FonctionnaliteMapper.java" },
  { template: "infra/mapper/administration/UserSiteMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/UserSiteMapper.java" },
  { template: "infra/mapper/administration/UserSiteDroitsMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/UserSiteDroitsMapper.java" },
  { template: "infra/mapper/administration/GroupeRoleMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/GroupeRoleMapper.java" },
  { template: "infra/mapper/administration/GroupeProfilMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/GroupeProfilMapper.java" },
  { template: "infra/mapper/administration/ProfilDroitMapper.java.hbs", outPath: () => "src/main/java/com/stockpro/mapper/administration/ProfilDroitMapper.java" },
  { template: "infra/service/administration/UserService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/UserService.java" },
  { template: "infra/service/administration/impl/UserServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/UserServiceImpl.java" },
  { template: "infra/service/administration/RoleService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/RoleService.java" },
  { template: "infra/service/administration/impl/RoleServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/RoleServiceImpl.java" },
  { template: "infra/service/administration/SiteService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/SiteService.java" },
  { template: "infra/service/administration/impl/SiteServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/SiteServiceImpl.java" },
  { template: "infra/service/administration/GroupeService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/GroupeService.java" },
  { template: "infra/service/administration/impl/GroupeServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/GroupeServiceImpl.java" },
  { template: "infra/service/administration/ProfilService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/ProfilService.java" },
  { template: "infra/service/administration/impl/ProfilServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/ProfilServiceImpl.java" },
  { template: "infra/service/administration/ApplicationService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/ApplicationService.java" },
  { template: "infra/service/administration/impl/ApplicationServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/ApplicationServiceImpl.java" },
  { template: "infra/service/administration/FonctionnaliteService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/FonctionnaliteService.java" },
  { template: "infra/service/administration/impl/FonctionnaliteServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/FonctionnaliteServiceImpl.java" },
  { template: "infra/service/administration/UserSiteService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/UserSiteService.java" },
  { template: "infra/service/administration/impl/UserSiteServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/UserSiteServiceImpl.java" },
  { template: "infra/service/administration/UserSiteDroitsService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/UserSiteDroitsService.java" },
  { template: "infra/service/administration/impl/UserSiteDroitsServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/UserSiteDroitsServiceImpl.java" },
  { template: "infra/service/administration/GroupeRoleService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/GroupeRoleService.java" },
  { template: "infra/service/administration/impl/GroupeRoleServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/GroupeRoleServiceImpl.java" },
  { template: "infra/service/administration/GroupeProfilService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/GroupeProfilService.java" },
  { template: "infra/service/administration/impl/GroupeProfilServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/GroupeProfilServiceImpl.java" },
  { template: "infra/service/administration/ProfilDroitService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/ProfilDroitService.java" },
  { template: "infra/service/administration/impl/ProfilDroitServiceImpl.java.hbs", outPath: () => "src/main/java/com/stockpro/service/administration/impl/ProfilDroitServiceImpl.java" },
  { template: "infra/controller/administration/UserController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/UserController.java" },
  { template: "infra/controller/administration/RoleController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/RoleController.java" },
  { template: "infra/controller/administration/SiteController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/SiteController.java" },
  { template: "infra/controller/administration/GroupeController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/GroupeController.java" },
  { template: "infra/controller/administration/ProfilController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/ProfilController.java" },
  { template: "infra/controller/administration/ApplicationController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/ApplicationController.java" },
  { template: "infra/controller/administration/FonctionnaliteController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/FonctionnaliteController.java" },
  { template: "infra/controller/administration/UserSiteController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/UserSiteController.java" },
  { template: "infra/controller/administration/UserSiteDroitsController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/UserSiteDroitsController.java" },
  { template: "infra/controller/administration/GroupeRoleController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/GroupeRoleController.java" },
  { template: "infra/controller/administration/GroupeProfilController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/GroupeProfilController.java" },
  { template: "infra/controller/administration/ProfilDroitController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/administration/ProfilDroitController.java" },
  { template: "infra/service/auth/AuthorizationService.java.hbs", outPath: () => "src/main/java/com/stockpro/service/auth/AuthorizationService.java" },
  { template: "infra/controller/auth/AuthController.java.hbs", outPath: () => "src/main/java/com/stockpro/controller/auth/AuthController.java" },
  { template: "infra/dto/auth/LoginRequestDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/LoginRequestDTO.java" },
  { template: "infra/dto/auth/AuthResponseDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/AuthResponseDTO.java" },
  { template: "infra/dto/auth/RefreshRequestDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/RefreshRequestDTO.java" },
  { template: "infra/dto/auth/MeResponseDTO.java.hbs", outPath: () => "src/main/java/com/stockpro/dto/auth/MeResponseDTO.java" },
  { template: "infra/util/ExcelExporter.java.hbs", outPath: () => "src/main/java/com/stockpro/util/ExcelExporter.java" },
];

function loadTemplates(selectedLayers = [...LAYERS, ...CORE_LAYERS]) {
  const compiled = {};
  for (const layer of selectedLayers) {
    const raw = fs.readFileSync(path.join(TEMPLATES_DIR, layer.template), "utf8");
    compiled[layer.template] = Handlebars.compile(raw, { noEscape: true });
  }
  return compiled;
}

function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
}

function javaTypeToTsType(javaType) {
  return {
    UUID: "string", String: "string", Integer: "number", Long: "number",
    Double: "number", Float: "number", BigDecimal: "number", Boolean: "boolean",
    LocalDate: "string", LocalDateTime: "string",
  }[javaType] || "unknown";
}

function isJavaIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function normalizeEntity(entity, source) {
  if (!entity || typeof entity !== "object") {
    throw new Error(`${source}: expected an entity object`);
  }
  for (const field of REQUIRED_ENTITY_FIELDS) {
    if (!entity[field]) {
      throw new Error(`${source}: entity.${field} is required`);
    }
  }
  for (const field of ["name", "module", "idField", "urlPath"]) {
    if (!isJavaIdentifier(entity[field]) && field !== "urlPath") {
      throw new Error(`${source}: entity.${field} is not a valid identifier`);
    }
  }

  const idType = getIdTypeDefault(entity);

  if (!isValidIdType(idType)) {
    throw new Error(`${source}: entity.idType must be one of ${VALID_ID_TYPES.join(", ")}`);
  }

  const normalized = {
    ...entity,
    idType,
    idFieldCap: entity.idFieldCap || capitalize(entity.idField),
    repoVar: entity.repoVar || `${lowerFirst(entity.name)}Repository`,
    serviceVar: entity.serviceVar || `${lowerFirst(entity.name)}Service`,
    fields: entity.fields || [],
    updatableFields: entity.updatableFields || [],
    manyToOne: entity.manyToOne || [],
    oneToMany: entity.oneToMany || [],
    relationIds: entity.relationIds || [],
    customFinders: entity.customFinders || [],
    exportColumns: entity.exportColumns || [],
    kebabName: entity.kebabName || toKebabCase(entity.name),
    tsType: entity.tsType || javaTypeToTsType(entity.idType || "UUID"),
  };

  normalized.kebabName = toKebabCase(normalized.name);
  normalized.fields = normalized.fields.map((field) => ({
    ...field,
    tsType: field.tsType || javaTypeToTsType(field.javaType),
    validationRules: [
      field.required ? "Validators.required" : null,
      field.email ? "Validators.email" : null,
      field.minLength ? `Validators.minLength(${field.minLength})` : null,
      field.maxLength ? `Validators.maxLength(${field.maxLength})` : null,
    ].filter(Boolean),
  }));

  normalized.hasValidation = normalized.fields.some((field) =>
    field.required || field.email || field.minLength || field.maxLength
  );
  normalized.hasWriteOnlyField = normalized.fields.some((field) => field.writeOnly);
  normalized.hasOneToMany = normalized.oneToMany.length > 0;
  normalized.hasManyToOne = normalized.manyToOne.length > 0;
  normalized.needsLocalDate = normalized.fields.some((field) =>
    ["LocalDate", "LocalDateTime"].includes(field.javaType)
  );
  normalized.needsPage = entity.features?.pagination !== false;
  const securityLevel = entity.securityLevel || "medium";
  const securityOperations = {
    low: ["consultation"],
    medium: ["consultation", "ajout", "modification"],
    high: ["consultation", "export", "ajout", "modification", "suppression"],
  }[securityLevel];
  if (!securityOperations) {
    throw new Error(`${source}: securityLevel must be low, medium, or high`);
  }
  normalized.securityLevel = securityLevel;
  normalized.securityOperations = Object.fromEntries(
    ["consultation", "export", "ajout", "modification", "suppression"]
      .map((operation) => [operation, securityOperations.includes(operation)])
  );
  normalized.features = {
    pagination: normalized.needsPage,
    export: entity.features?.export !== false && normalized.exportColumns.length > 0,
    search: entity.features?.search !== false,
    filtering: entity.features?.filtering !== false,
    security: entity.features?.security !== false,
    validation: normalized.hasValidation,
  };
  normalized.needsBigDecimal = normalized.fields.some((field) => field.javaType === "BigDecimal");
  normalized.searchFields = normalized.fields.filter((field) => field.javaType === "String" && !field.writeOnly);
  const parsers = { String: "value", UUID: "java.util.UUID.fromString(value)",
    LocalDate: "java.time.LocalDate.parse(value)", LocalDateTime: "java.time.LocalDateTime.parse(value)",
    BigDecimal: "new java.math.BigDecimal(value)" };
  normalized.filterFields = normalized.fields.filter((field) => !field.writeOnly).map((field) => ({
    ...field, filterExpression: parsers[field.javaType] || `${field.javaType}.valueOf(value)`,
  }));
  normalized.permissionCode = entity.permissionCode || `ADMIN_${entity.name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;
  normalized.defaultSortField = entity.defaultSortField || entity.idField;
  normalized.tagLabel = entity.tagLabel || `${entity.name}s`;
  normalized.tagLabelLower = entity.tagLabelLower || normalized.tagLabel.toLowerCase();
  if (!entity.updatableFields) normalized.updatableFields = normalized.fields.filter((field) => field.name !== entity.idField).map((field) => ({ nameCap: field.nameCap || capitalize(field.name) }));

  const usesList = normalized.features.pagination ||
      normalized.features.export ||
      normalized.securityOperations.consultation;
  const usesMap = normalized.features.pagination || normalized.features.export;
  normalized.needsListImport = Boolean(usesList);
  normalized.needsMapImport = Boolean(usesMap);

  normalized.needsUuidImport =
    normalized.idType === "UUID" ||
    normalized.fields.some((field) => field.javaType === "UUID") ||
    normalized.manyToOne.some((r) => r.targetIdType === "UUID") ||
    normalized.relationIds.some((r) => r.targetIdType === "UUID");

  for (const field of normalized.fields) {
    if (!isJavaIdentifier(field.name)) {
      throw new Error(`${source}: invalid field name '${field.name}'`);
    }
    field.nameCap = field.nameCap || capitalize(field.name);
  }
  for (const relation of normalized.manyToOne) {
    if (!relation.target || !relation.fieldName || !relation.joinColumn) {
      throw new Error(`${source}: every manyToOne relation needs target, fieldName, and joinColumn`);
    }
    relation.fieldNameCap = relation.fieldNameCap || capitalize(relation.fieldName);
    relation.targetModule = relation.targetModule || normalized.module;
    relation.targetIdField = relation.targetIdField || "id";
    relation.targetIdFieldCap = relation.targetIdFieldCap || capitalize(relation.targetIdField);
    relation.targetIdType = relation.targetIdType || "UUID";
    relation.tsType = relation.tsType || javaTypeToTsType(relation.targetIdType);
    relation.idFieldName = `${relation.fieldName}Id`;
    relation.idOptional = relation.nullable !== false;
    if (!VALID_ID_TYPES.includes(relation.targetIdType)) {
      throw new Error(`${source}: relation '${relation.fieldName}' targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }
  normalized.manyToOneImports = [];
  normalized.manyToOneRepoImports = [];
  for (const relation of normalized.manyToOne) {
    if (relation.targetModule !== normalized.module && !normalized.manyToOneImports.find((r) => r.module === relation.targetModule && r.name === relation.target)) {
      normalized.manyToOneImports.push({ module: relation.targetModule, name: relation.target });
    }
    if (!normalized.manyToOneRepoImports.find((r) => r.module === relation.targetModule && r.name === relation.target)) {
      normalized.manyToOneRepoImports.push({ module: relation.targetModule, name: relation.target });
    }
  }
  for (const relation of normalized.relationIds) {
    if (!relation.target || !relation.fieldName || !relation.targetIdField) {
      throw new Error(`${source}: every relationIds entry needs target, fieldName, and targetIdField`);
    }
    relation.fieldNameCap = relation.fieldNameCap || capitalize(relation.fieldName);
    relation.targetIdFieldCap = relation.targetIdFieldCap || capitalize(relation.targetIdField);
    relation.targetIdType = relation.targetIdType || "UUID";
    if (!VALID_ID_TYPES.includes(relation.targetIdType)) {
      throw new Error(`${source}: relationIds '${relation.fieldName}' targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }
  normalized.needsUuidImport = normalized.needsUuidImport || [...normalized.manyToOne, ...normalized.relationIds].some((relation) => relation.targetIdType === "UUID");
  normalized.manyToOneResolvers = normalized.manyToOne.filter((relation, index, all) => all.findIndex((candidate) => candidate.target === relation.target && candidate.targetModule === relation.targetModule) === index);
  for (const relation of normalized.oneToMany) {
    const targetModule = relation.targetModule || normalized.module;
    if (targetModule !== normalized.module && !normalized.manyToOneImports.some((item) => item.module === targetModule && item.name === relation.target)) {
      normalized.manyToOneImports.push({ module: targetModule, name: relation.target });
    }
  }
  normalized.customFinderEntityImports = [];
  for (const finder of normalized.customFinders) {
    const matches = (finder.returnType || "").match(/[A-Z][A-Za-z0-9]*/g) || [];
    for (const className of matches) {
      if (className === normalized.name) continue;
      if (!normalized.customFinderEntityImports.includes(className)) {
        normalized.customFinderEntityImports.push(className);
      }
    }
  }
  return normalized;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function loadSchemas(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Schema input does not exist: ${inputPath}`);
  }
  const stat = fs.statSync(inputPath);
  const files = stat.isDirectory()
    ? fs.readdirSync(inputPath).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(inputPath, f))
    : [inputPath];

  return files.map((file) => {
    let schema;
    try {
      schema = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      throw new Error(`${file}: invalid JSON (${error.message})`);
    }
    return normalizeEntity(schema.entity, file);
  });
}

function validateSchemaSet(entities, options = {}) {
  return validateModule.validateSchemaSet(entities, options);
}

function writeFile(filePath, content, options, report) {
  if (options.dryRun) {
    report.planned += 1;
    console.log(`  plan             ${filePath}`);
    return;
  }
  if (fs.existsSync(filePath) && !options.force) {
    report.skipped += 1;
    console.log(`  skip   (exists) ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  report.written += 1;
  console.log(`  wrote           ${filePath}`);
}

function generateEntity(entity, compiled, outputRoot, options, report, schemaOutputPaths) {
  const javaRoot = path.join(outputRoot, "src/main/java/com/stockpro");
  console.log(`\n${entity.name} (${entity.module})`);
  for (const layer of LAYERS) {
    const render = compiled[layer.template];
    const content = render({ entity });
    const outFile = path.join(javaRoot, layer.outPath(entity));
    if (schemaOutputPaths) schemaOutputPaths.add(path.normalize(outFile));
    writeFile(outFile, content, options, report);
  }
}

// Emits the fixed, non-entity infrastructure (auth/security/bootstrap) so the app boots.
// Core layers that would overwrite a schema-driven entity on the same path are skipped,
// so the schema definition of an entity always wins consistently (e.g. an admin entity
// such as Role that the input schema also models).
function generateCore(compiled, outputRoot, options, report, schemaOutputPaths, entities = []) {
  console.log("\nCore (auth / infrastructure)");
  for (const layer of CORE_LAYERS) {
    const render = compiled[layer.template];
    if (!render) continue;
    const content = render({ entities });
    const outFile = path.normalize(path.join(outputRoot, layer.outPath()));
    if (schemaOutputPaths && schemaOutputPaths.has(outFile)) {
      if (options.dryRun) {
        report.planned += 1;
        console.log(`  plan             ${outFile}`);
      } else {
        report.skipped += 1;
        console.log(`  skip   (schema) ${outFile}`);
      }
      continue;
    }
    writeFile(outFile, content, options, report);
  }
}

function printHelp() {
  console.log(`Usage: node generate.js <schema.json | schemas-dir> <output-dir> [options]

Options:
  --force     overwrite existing generated files
  --dry-run   show planned files without writing them
  --verbose   print additional generation details
  --strict-relations  fail when a relation target is not in the input set
  --help      show this help

Frontend generation is handled separately by generate-frontend.js using a
template pack (.spack). See tools/pack-frontend.js.`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");
  const strictRelations = args.includes("--strict-relations");
  const positional = args.filter((a) => !a.startsWith("--"));
  const [schemaInput, outputDir] = positional;

  if (!schemaInput || !outputDir) {
    printHelp();
    process.exit(1);
  }

  try {
    const templateLayers = [...LAYERS, ...CORE_LAYERS];
    const compiled = loadTemplates(templateLayers);
    const schemas = loadSchemas(schemaInput);
    const names = new Set();
    const report = { written: 0, skipped: 0, planned: 0 };
    const schemaOutputPaths = new Set();

    const warnings = validateSchemaSet(schemas, { strict: strictRelations });
    for (const warning of warnings) console.warn(`Warning: ${warning}`);

    for (const entity of schemas) {
      const key = `${entity.module}.${entity.name}`;
      if (names.has(key)) {
        throw new Error(`Duplicate entity: ${key}`);
      }
      names.add(key);
      if (verbose) console.log(`Features: ${JSON.stringify(entity.features)}`);
      generateEntity(entity, compiled, outputDir, { force, dryRun }, report, schemaOutputPaths);
    }
    generateCore(compiled, outputDir, { force, dryRun }, report, schemaOutputPaths, schemas);
    console.log(`\nSummary: ${report.written} written, ${report.skipped} skipped, ${report.planned} planned`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadSchemas,
  normalizeEntity,
  validateSchemaSet,
  validateEntitySchema: validateModule.validateEntitySchema,
  generateEntity,
};
