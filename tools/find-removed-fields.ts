import * as fs from 'fs';
import { buildASTSchema, parse, ObjectTypeDefinitionNode, GraphQLObjectType } from 'graphql';

// console.log('process.argv[0]: ', process.argv[0]);
// console.log('process.argv[1]: ', process.argv[1]);
// console.log('process.argv[2]: ', process.argv[2]);
// console.log('process.argv[3]: ', process.argv[3]);

const schemaText = fs.readFileSync(process.argv[3], 'utf-8');
const sourceSchema = fs.readFileSync(process.argv[2], 'utf-8');

const schema = buildASTSchema(parse(schemaText));
const sourceSchemaAST = parse(sourceSchema);

const entityTypes = schema.getTypeMap();
const sourceEntityTypes = sourceSchemaAST.definitions
  .filter(def => def.kind === 'ObjectTypeDefinition')
  .map(def => (def as ObjectTypeDefinitionNode).name.value);

// console.log('Entities:', sourceEntityTypes.join(', '));

interface RemovedFieldsMap {
  [entityType: string]: string[];
}

const removedFieldsMap: RemovedFieldsMap = {};

for (const entityType of sourceEntityTypes) {
  if (!entityTypes[entityType]) {
    console.log(`!!! WARNING !!! - Entity "${entityType}" not found in the schema.`);
    continue;
  }

  const entityFields = (entityTypes[entityType] as GraphQLObjectType).getFields();

  const sourceEntityDefinition = sourceSchemaAST.definitions
    .find(def => def.kind === 'ObjectTypeDefinition' && (def as ObjectTypeDefinitionNode).name.value === entityType) as ObjectTypeDefinitionNode | undefined;

  const sourceEntityFields = sourceEntityDefinition?.fields?.map(field => field.name.value) || [];

  const removedFields = Object.keys(entityFields)
    .filter(field => !sourceEntityFields.includes(field));

  // console.log(`Removed Fields for ${entityType}:`, removedFields.join(', '));

  if (removedFields.length > 0)
    removedFieldsMap[entityType] = removedFields;
}

console.log('map: ', removedFieldsMap);
