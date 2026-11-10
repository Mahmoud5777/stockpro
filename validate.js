#!/usr/bin/env node
/**
 * Formal schema contract for the StockPro backend generator.
 *
 * Provides:
 *   - validateEntitySchema(entity, source): throws on any contract violation
 *   - validateSchemaSet(entities, options): validates the complete entity graph
 *     (duplicates, cross references, relation integrity)
 *
 * Validated concerns:
 *   required properties, valid Java identifiers, valid package names, valid Java
 *   types, duplicate entities/fields/routes/tables, valid ID configuration,
 *   valid validation rules, valid relation definitions, valid relation target
 *   names, valid mappedBy fields, valid relation ID fields, custom finders.
 */

const VALID_ID_TYPES = ["UUID", "String", "Long"];
const VALID_JAVA_TYPES = [
  "String", "Integer", "Long", "Double", "Float", "Boolean",
  "LocalDate", "LocalDateTime", "BigDecimal", "UUID",
];
const VALID_SECURITY_LEVELS = ["low", "medium", "high"];
const VALID_AUTH_TYPES = ["jwt", "session", "none"];

const VALID_FRAMEWORKS = ["next"];
const VALID_UI_LIBRARIES = {
  next: ["tailwind"],
};
const VALID_STATE_LIBS = {
  next: ["zustand"],
};

function isJavaIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function isPackageName(value) {
  if (typeof value !== "string" || !value) return false;
  return value.split(".").every((part) => isJavaIdentifier(part));
}

function validateEntitySchema(entity, source) {
  if (!entity || typeof entity !== "object") {
    throw new Error(`${source}: expected an entity object`);
  }

  for (const field of ["module", "name", "tableName", "idField", "idColumn", "urlPath"]) {
    if (!entity[field]) {
      throw new Error(`${source}: entity.${field} is required`);
    }
  }

  for (const field of ["name", "module", "idField", "idColumn", "urlPath"]) {
    if (!isJavaIdentifier(entity[field]) && field !== "urlPath") {
      throw new Error(`${source}: entity.${field} is not a valid Java identifier`);
    }
  }
  if (!/^[a-z0-9-]+$/.test(entity.urlPath)) {
    throw new Error(`${source}: entity.urlPath '${entity.urlPath}' must be a valid URL path (lowercase, digits, hyphens)`);
  }
  if (!isPackageName(entity.module)) {
    throw new Error(`${source}: entity.module '${entity.module}' is not a valid package name`);
  }

  if (!VALID_ID_TYPES.includes(entity.idType)) {
    throw new Error(`${source}: entity.idType must be one of ${VALID_ID_TYPES.join(", ")}`);
  }

  // Fields
  const fieldNames = new Set();
  for (const field of entity.fields || []) {
    if (!isJavaIdentifier(field.name)) {
      throw new Error(`${source}: field '${field.name}' is not a valid Java identifier`);
    }
    if (fieldNames.has(field.name)) {
      throw new Error(`${source}: duplicate field '${field.name}'`);
    }
    fieldNames.add(field.name);
    if (!VALID_JAVA_TYPES.includes(field.javaType)) {
      throw new Error(`${source}: field '${field.name}' has invalid javaType '${field.javaType}'`);
    }
    if (field.required && typeof field.errorMessage !== "string") {
      throw new Error(`${source}: field '${field.name}' is required but has no errorMessage`);
    }
    if (field.minLength && field.maxLength && field.minLength > field.maxLength) {
      throw new Error(`${source}: field '${field.name}' minLength > maxLength`);
    }
  }

  // Relations: manyToOne
  for (const rel of entity.manyToOne || []) {
    if (!rel.target || !rel.fieldName || !rel.joinColumn) {
      throw new Error(`${source}: every manyToOne relation needs target, fieldName and joinColumn`);
    }
    if (!isJavaIdentifier(rel.fieldName)) {
      throw new Error(`${source}: manyToOne fieldName '${rel.fieldName}' is not a valid identifier`);
    }
    if (!isJavaIdentifier(rel.joinColumn)) {
      throw new Error(`${source}: manyToOne joinColumn '${rel.joinColumn}' is not a valid identifier`);
    }
    if (rel.targetIdField && !isJavaIdentifier(rel.targetIdField)) {
      throw new Error(`${source}: manyToOne targetIdField '${rel.targetIdField}' is not a valid identifier`);
    }
    if (rel.targetIdType && !VALID_ID_TYPES.includes(rel.targetIdType)) {
      throw new Error(`${source}: manyToOne targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }

  // Relations: oneToMany
  for (const rel of entity.oneToMany || []) {
    if (!rel.target || !rel.fieldName || !rel.mappedBy) {
      throw new Error(`${source}: every oneToMany relation needs target, fieldName and mappedBy`);
    }
    if (!isJavaIdentifier(rel.fieldName)) {
      throw new Error(`${source}: oneToMany fieldName '${rel.fieldName}' is not a valid identifier`);
    }
    if (!isJavaIdentifier(rel.mappedBy)) {
      throw new Error(`${source}: oneToMany mappedBy '${rel.mappedBy}' is not a valid identifier`);
    }
  }

  // Relations: relationIds
  for (const rel of entity.relationIds || []) {
    if (!rel.target || !rel.fieldName || !rel.targetIdField) {
      throw new Error(`${source}: every relationIds entry needs target, fieldName and targetIdField`);
    }
    if (!isJavaIdentifier(rel.fieldName)) {
      throw new Error(`${source}: relationIds fieldName '${rel.fieldName}' is not a valid identifier`);
    }
    if (!isJavaIdentifier(rel.targetIdField)) {
      throw new Error(`${source}: relationIds targetIdField '${rel.targetIdField}' is not a valid identifier`);
    }
    if (rel.targetIdType && !VALID_ID_TYPES.includes(rel.targetIdType)) {
      throw new Error(`${source}: relationIds targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }

  // Custom finders
  for (const finder of entity.customFinders || []) {
    if (!finder.methodName || !finder.returnType || !finder.paramType || !finder.paramName) {
      throw new Error(`${source}: every customFinder needs methodName, returnType, paramType and paramName`);
    }
    if (!isJavaIdentifier(finder.methodName)) {
      throw new Error(`${source}: customFinder methodName '${finder.methodName}' is not a valid identifier`);
    }
  }

  // Security configuration
  if (entity.securityLevel && !VALID_SECURITY_LEVELS.includes(entity.securityLevel)) {
    throw new Error(`${source}: entity.securityLevel must be one of ${VALID_SECURITY_LEVELS.join(", ")}`);
  }
  if (entity.features && typeof entity.features === "object") {
    const boolFeatures = ["pagination", "search", "export", "security", "validation"];
    for (const f of boolFeatures) {
      if (entity.features[f] !== undefined && typeof entity.features[f] !== "boolean") {
        throw new Error(`${source}: features.${f} must be a boolean`);
      }
    }
  }

  return true;
}

function validateSchemaSet(entities, options = {}) {
  const strict = options.strict !== false;
  const warnings = [];
  const keys = new Set(entities.map((e) => `${e.module}.${e.name}`));
  const tables = new Map();
  const routes = new Map();

  for (const entity of entities) {
    validateEntitySchema(entity, entity.name || "entity");

    // Duplicate tables
    if (tables.has(entity.tableName)) {
      throw new Error(`Duplicate table name '${entity.tableName}' used by '${tables.get(entity.tableName)}' and '${entity.name}'`);
    }
    tables.set(entity.tableName, entity.name);

    // Duplicate routes
    if (routes.has(entity.urlPath)) {
      throw new Error(`Duplicate URL path '${entity.urlPath}' used by '${routes.get(entity.urlPath)}' and '${entity.name}'`);
    }
    routes.set(entity.urlPath, entity.name);
  }

  // Cross-entity relation integrity
  for (const entity of entities) {
    const relations = [
      ...(entity.manyToOne || []),
      ...(entity.oneToMany || []),
      ...(entity.relationIds || []),
    ];
    for (const relation of relations) {
      const targetKey = relation.module
        ? `${relation.module}.${relation.target}`
        : [...keys].find((k) => k.endsWith(`.${relation.target}`));
      const targetExists = targetKey ? keys.has(targetKey) : false;
      if (!targetExists) {
        const message = `${entity.module}.${entity.name}: relation target '${relation.target}' is not included in the schema set`;
        if (strict) throw new Error(message);
        warnings.push(message);
      }
    }

    // mappedBy must reference a real manyToOne field on the target, but only
    // when the target actually declares its side of the relation (both sides
    // defined). This keeps single-entity partial graphs from failing.
    for (const rel of entity.oneToMany || []) {
      const target = [...entities].find((e) => e.name === rel.target && e.module === (rel.module || entity.module));
      if (target && target.manyToOne && target.manyToOne.length > 0) {
        const backRef = (target.manyToOne || []).find((m) => m.fieldName === rel.mappedBy);
        if (!backRef) {
          const message = `${entity.module}.${entity.name}: oneToMany '${rel.fieldName}' mappedBy '${rel.mappedBy}' has no matching manyToOne on '${rel.target}'`;
          if (strict) throw new Error(message);
          warnings.push(message);
        }
      }
    }
  }

  return warnings;
}

function validateFrontendManifest(frontend, source = "frontend") {
  if (!frontend || typeof frontend !== "object") {
    throw new Error(`${source}: frontend configuration is required when the target includes frontend`);
  }
  if (!VALID_FRAMEWORKS.includes(frontend.framework)) {
    throw new Error(`${source}: framework must be one of ${VALID_FRAMEWORKS.join(", ")}`);
  }
  const uiOk = (VALID_UI_LIBRARIES[frontend.framework] || []).includes(frontend.uiLibrary);
  if (!uiOk) {
    throw new Error(`${source}: uiLibrary '${frontend.uiLibrary}' is not valid for framework '${frontend.framework}'`);
  }
  const stOk = (VALID_STATE_LIBS[frontend.framework] || []).includes(frontend.state);
  if (!stOk) {
    throw new Error(`${source}: state '${frontend.state}' is not valid for framework '${frontend.framework}'`);
  }
  if (typeof frontend.features !== "object" || frontend.features === null) {
    throw new Error(`${source}: features must be an object`);
  }
  return true;
}

module.exports = {
  validateEntitySchema,
  validateSchemaSet,
  validateFrontendManifest,
  VALID_ID_TYPES,
  VALID_JAVA_TYPES,
  VALID_FRAMEWORKS,
  VALID_UI_LIBRARIES,
  VALID_STATE_LIBS,
};
