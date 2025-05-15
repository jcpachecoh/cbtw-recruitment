import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Candidates';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const technicalLeadId = searchParams.get('technicalLeadId');

    if (!technicalLeadId) {
      return NextResponse.json({
        message: 'Technical lead ID is required',
      }, { status: 400 });
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'technicalLeadId = :technicalLeadId',
      ExpressionAttributeValues: {
        ':technicalLeadId': technicalLeadId
      }
    });

    const response = await docClient.send(command);

    return NextResponse.json({
      message: 'Candidates retrieved successfully',
      data: response.Items || []
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({
      message: 'Error fetching candidates',
      error: errorMessage
    }, { status: 500 });
  }
}
