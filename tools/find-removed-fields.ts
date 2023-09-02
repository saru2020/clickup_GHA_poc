import * as fs from "fs";
import { parse, ObjectTypeDefinitionNode } from "graphql";

const sourceSchemaFile = fs.readFileSync(process.argv[2], "utf-8");
const amplifyGeneratedSchemaFile = fs.readFileSync(process.argv[3], "utf-8");

const sourceSchemaAST = parse(sourceSchemaFile);
const amplifyGeneratedSchemaAST = parse(amplifyGeneratedSchemaFile);

const sourceEntityTypes = sourceSchemaAST.definitions
  .filter((def) => def.kind === "ObjectTypeDefinition")
  .map((def) => (def as ObjectTypeDefinitionNode).name.value);

const amplifyGeneratedEntityTypes = amplifyGeneratedSchemaAST.definitions
  .filter((def) => def.kind === "ObjectTypeDefinition")
  .map((def) => (def as ObjectTypeDefinitionNode).name.value);

interface RemovedFieldsMap {
  [entityType: string]: string[];
}

const removedFieldsMap: RemovedFieldsMap = {};

for (const entityType of sourceEntityTypes) {
  if (!amplifyGeneratedEntityTypes.includes(entityType)) {
    console.log(
      `!!! WARNING !!! - Entity "${entityType}" not found in the Amplify-generated schema.`,
    );
    continue;
  }

  const entityFields =
    (
      amplifyGeneratedSchemaAST.definitions.find(
        (def) =>
          def.kind === "ObjectTypeDefinition" &&
          (def as ObjectTypeDefinitionNode).name.value === entityType,
      ) as ObjectTypeDefinitionNode
    ).fields?.map((field) => field.name.value) || [];

  const sourceEntityDefinition = sourceSchemaAST.definitions.find(
    (def) =>
      def.kind === "ObjectTypeDefinition" &&
      (def as ObjectTypeDefinitionNode).name.value === entityType,
  ) as ObjectTypeDefinitionNode | undefined;

  const sourceEntityFields =
    sourceEntityDefinition?.fields?.map((field) => field.name.value) || [];

  const removedFields = sourceEntityFields.filter(
    (field) => !entityFields.includes(field),
  );

  if (removedFields.length > 0) removedFieldsMap[entityType] = removedFields;
}

console.log("map: ", removedFieldsMap);
