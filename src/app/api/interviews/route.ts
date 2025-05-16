import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { ensureInterviewsTable } from "@/app/utils/dynamo";
import { client } from "../../utils/dynamoClient";

const TABLE_NAME = "Interviews";

const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    await ensureInterviewsTable();
    const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const scanCmd = new ScanCommand({ TableName: TABLE_NAME });
    const scanRes = await docClient.send(scanCmd);
    return NextResponse.json({ items: scanRes.Items || [] });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error fetching interview results",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Ensure the Interviews table exists before proceeding
    await ensureInterviewsTable();
    const body = await request.json();
    const { candidateId, results } = body;
    if (!candidateId || !results) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    // Fetch existing interview record
    let interviewResults: { [key: string]: any } = {};
    try {
      const getCmd = new GetCommand({
        TableName: TABLE_NAME,
        Key: { candidateId: String(candidateId) },
      });
      const getRes = await docClient.send(getCmd);
      if (getRes.Item && getRes.Item.results) {
        interviewResults = getRes.Item.results;
      }
    } catch (err) {
      // If error, treat as new record
      interviewResults = {};
    }
    // Update the results object
    interviewResults = { ...interviewResults, ...results };
    const putCmd = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        candidateId: String(candidateId),
        results: interviewResults,
        updatedAt: new Date().toISOString(),
      },
    });
    await docClient.send(putCmd);
    return NextResponse.json({ message: "Interview grade saved" });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error saving interview grade",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
