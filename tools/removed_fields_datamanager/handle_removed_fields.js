const fs = require("fs");
// import { findRemovedFields } from "./find-removed-fields";
const { findRemovedFields } = require("./find-removed-fields.js");
// const { removedFieldsFromDDB } = require("./removeFields"); // Adjust the path as needed
const { updateRemovedFields } = require("./update_removed_fields_DDB.js"); // Adjust the path as needed

const sourceSchemaFile = fs.readFileSync(process.argv[2], "utf-8");
const amplifyGeneratedSchemaFile = fs.readFileSync(process.argv[3], "utf-8");
const environment = process.argv[4];
const ddbHash = process.argv[5];

const removedFieldsMap = findRemovedFields(
  sourceSchemaFile,
  amplifyGeneratedSchemaFile,
);

console.log("map: ", removedFieldsMap);
// updateRemovedFields(removedFieldsMap);
const dynamicRemovedFieldsMap = generateDynamicKeys(
  removedFieldsMap,
  environment,
  ddbHash,
);
updateRemovedFields(dynamicRemovedFieldsMap);

// // TODO: write a function to extract the table name based on the env along with the hashes
// const removedFields = {
//   "Building-s42msu7f6vfoxntkysnewoz7ii-sbtestiii": ["Sample1", "Sample2"],
// };

// updateRemovedFields(removedFields);

function generateDynamicKeys(map, environment, ddbHash) {
  const dynamicKeyMap = {};

  for (const tableName in map) {
    if (tableName in map) {
      // Generate the dynamic table name
      const dynamicTableName = `${tableName}-${ddbHash}-${environment}`;
      // Copy the array of fields
      const fieldsToRemove = map[tableName].slice();

      // Add the entry to the new map with the dynamic key
      dynamicKeyMap[dynamicTableName] = fieldsToRemove;
    }
  }

  return dynamicKeyMap;
}
