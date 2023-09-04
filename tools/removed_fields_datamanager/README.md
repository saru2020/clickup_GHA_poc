# Removed Fields Data Manager

Removed Fields Data Manager / `handle_removed_fields.js` is used to remove the data of all the removed fields from the DynamoDB database 

## Steps
run `node handle_removed_fields.js <source schema.graphql file path> <destination schema.graphql file path> <environment> <hash key of table>`

`source schema.graphql file path` - refers to the schema.graphql file before the field was removed
`destination schema.graphql file path` - refers to the schema.graphql file after the field was removed
`environment` - refers to the environment in which the chnages are to be done
`hash key of table` = refers to the hash key of the DDB table [note: DDB generates a table in this format `<Tablename-HashKey-EnvironmentName>` when multiple amplify apps in the same AWS account have the same entity name, otherwise DDB simply creates tables with the entity name defined in the schema.graphql] [another note: hash key is same for all the tables in DDB for a given app]

example:
`node tools/scripts/handle_removed_fields amplify/backend/api/propertymanagement/schema.graphql amplify/backend/api/propertymanagement/schema1.graphql sbtestiii s42msu7f6vfoxntkysnewoz7ii`
[note: change the path of schema1.graphql as required when running locally]


`handle_removed_fields.js` is ideally run through the GHA when a PR is merged and the changes in the schema are detected by comparing the git commits