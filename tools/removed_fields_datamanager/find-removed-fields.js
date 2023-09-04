// removeFields.js

const { parse } = require("graphql");

function findRemovedFields(sourceSchemaFile, amplifyGeneratedSchemaFile) {
  const sourceSchemaAST = parse(sourceSchemaFile);
  const amplifyGeneratedSchemaAST = parse(amplifyGeneratedSchemaFile);

  const sourceEntityTypes = sourceSchemaAST.definitions
    .filter((def) => def.kind === "ObjectTypeDefinition")
    .map((def) => def.name.value);

  const amplifyGeneratedEntityTypes = amplifyGeneratedSchemaAST.definitions
    .filter((def) => def.kind === "ObjectTypeDefinition")
    .map((def) => def.name.value);

  const removedFieldsMap = {};

  for (const entityType of sourceEntityTypes) {
    if (!amplifyGeneratedEntityTypes.includes(entityType)) {
      console.log(
        `!!! WARNING !!! - Entity "${entityType}" not found in the Amplify-generated schema.`,
      );
      continue;
    }

    const entityFields =
      amplifyGeneratedSchemaAST.definitions
        .find(
          (def) =>
            def.kind === "ObjectTypeDefinition" &&
            def.name.value === entityType,
        )
        .fields?.map((field) => field.name.value) || [];

    const sourceEntityDefinition = sourceSchemaAST.definitions.find(
      (def) =>
        def.kind === "ObjectTypeDefinition" && def.name.value === entityType,
    );

    const sourceEntityFields =
      sourceEntityDefinition?.fields?.map((field) => field.name.value) || [];

    const removedFields = sourceEntityFields.filter(
      (field) => !entityFields.includes(field),
    );

    if (removedFields.length > 0) removedFieldsMap[entityType] = removedFields;
  }

  return removedFieldsMap;
}

module.exports = { findRemovedFields };
