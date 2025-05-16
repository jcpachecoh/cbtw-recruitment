import { NextResponse } from "next/server";
import { client } from "../../../utils/dynamoClient";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ensureTableExists } from "../../utils/dynamo";

const TABLE_NAME = "Candidates";
const docClient = DynamoDBDocumentClient.from(client);

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await ensureTableExists(TABLE_NAME);
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    });
    const response = await docClient.send(command);
    if (!response.Item) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Candidate retrieved successfully",
      data: response.Item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching candidate",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  try {
    await ensureTableExists(TABLE_NAME);
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "set candidateStatus = :status",
      ExpressionAttributeValues: {
        ":status": body.candidateStatus,
      },
      ReturnValues: "ALL_NEW",
    });
    const response = await docClient.send(command);
    if (!response.Attributes) {
      return NextResponse.json(
        { message: "Candidate not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      message: "Candidate retrieved successfully",
      data: response.Attributes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching candidate",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
