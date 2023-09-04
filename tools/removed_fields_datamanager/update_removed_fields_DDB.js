// removeFields.js

const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-west-1" }); // Set your AWS region

// Define your DynamoDB document client
const dynamodb = new AWS.DynamoDB.DocumentClient();

function updateRemovedFields(removedFields) {
  // Iterate through each table in removedFields
  for (const tableName in removedFields) {
    const fieldsToRemove = removedFields[tableName];

    // Scan all items in the table
    const scanParams = {
      TableName: tableName,
    };

    dynamodb.scan(scanParams, (err, data) => {
      if (err) {
        console.error(`Error scanning table ${tableName}:`, err);
      } else {
        // Iterate through each item in the table
        data.Items.forEach((item) => {
          const updateExpression = {
            UpdateExpression:
              "REMOVE " + fieldsToRemove.map((field) => `#${field}`).join(", "),
            ExpressionAttributeNames: {},
          };

          // Dynamically build the ExpressionAttributeNames
          fieldsToRemove.forEach((field) => {
            updateExpression.ExpressionAttributeNames[`#${field}`] = field;
          });

          // Construct the Key
          const key = { id: item.id }; // Replace with your primary key

          // Update the item in the table with the modified data
          const updateParams = {
            TableName: tableName,
            Key: key,
            ...updateExpression,
          };

          dynamodb.update(updateParams, (err, data) => {
            if (err) {
              console.error(`Error updating item in table ${tableName}:`, err);
            } else {
              console.log(`Updated item in table ${tableName}:`, data);
            }
          });
        });
      }
    });
  }
}

module.exports = { updateRemovedFields };
