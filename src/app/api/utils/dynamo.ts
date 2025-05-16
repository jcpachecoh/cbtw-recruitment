import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { client } from "../../utils/dynamoClient";

const docClient = DynamoDBDocumentClient.from(client);

// Function to ensure table exists
const ensureTableExists = async (TableName: string) => {
  try {
    await docClient.send(
      new CreateTableCommand({
        TableName,
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      })
    );
    console.log("Table created successfully");
  } catch (error: any) {
    // Ignore if table already exists
    if (error.name !== "ResourceInUseException") {
      throw error;
    }
  }
};

export { ensureTableExists };
