import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { client } from "../utils/dynamoClient";

export async function ensureTableExists(
  tableName: string,
  keySchema: Array<{ AttributeName: string; KeyType: "HASH" | "RANGE" }>,
  attributeDefinitions: Array<{
    AttributeName: string;
    AttributeType: "S" | "N" | "B";
  }>,
  provisionedThroughput = { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
) {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    // Table exists
    return;
  } catch (err: any) {
    if (err.name !== "ResourceNotFoundException") {
      throw err;
    }
    // Table does not exist, create it
    await client.send(
      new CreateTableCommand({
        TableName: tableName,
        KeySchema: keySchema,
        AttributeDefinitions: attributeDefinitions,
        ProvisionedThroughput: provisionedThroughput,
      })
    );
  }
}

// Helper for Interviews table
export async function ensureInterviewsTable() {
  return ensureTableExists(
    "Interviews",
    [{ AttributeName: "candidateId", KeyType: "HASH" }],
    [{ AttributeName: "candidateId", AttributeType: "S" }]
  );
}
