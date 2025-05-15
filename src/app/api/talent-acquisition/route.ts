import { NextResponse } from "next/server";
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { ensureTableExists } from "../utils/dynamo";

const TABLE_NAME = "Candidates";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "dummy",
    secretAccessKey: "dummy",
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const DEFAULT_STATUS = "pending";

export async function GET() {
  try {
    // Ensure table exists before proceeding
    await ensureTableExists(TABLE_NAME);

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const response = await client.send(command);

    // Ensure all items have a status
    const items =
      response.Items?.map((item) => ({
        ...item,
        status: item.status || { S: DEFAULT_STATUS },
      })) || [];

    return NextResponse.json(
      {
        message: "Candidates retrieved successfully",
        data: items,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving candidates:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        message: "Error retrieving candidates",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();

    if (!data.id || (!data.status && !data.technicalLeadId)) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    let updateExpression = "SET";
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (data.status) {
      updateExpression += " #status = :status";
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = data.status;
    }

    if (data.technicalLeadId) {
      updateExpression += data.status ? ", " : " ";
      updateExpression += "#technicalLeadId = :technicalLeadId";
      expressionAttributeNames["#technicalLeadId"] = "technicalLeadId";
      expressionAttributeValues[":technicalLeadId"] = data.technicalLeadId;
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: data.id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await client.send(command);

    return NextResponse.json({
      message: "Candidate status updated successfully",
      data: response.Attributes,
    });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        message: "Error updating candidate status",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Ensure table exists before proceeding
    await ensureTableExists(TABLE_NAME);

    const formData = await request.json();
    const timestamp = new Date().toISOString();
    const id = uuidv4();

    // Prepare the item for DynamoDB
    const item = {
      id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      position: formData.position,
      linkedinUrl: formData.linkedinUrl,
      submittedAt: timestamp,
      feedback: formData.feedback,
      status: DEFAULT_STATUS,
      recruiterName: formData.recruiterId || "Unassigned",
      technicalLeadName: formData.technicalLeadId || "Unassigned",
    };

    // Save to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    return NextResponse.json(
      {
        message: "Form submitted successfully",
        data: { id, ...formData },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing form submission:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        message: "Error submitting form",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
