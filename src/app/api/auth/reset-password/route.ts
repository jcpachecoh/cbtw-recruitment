import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { compare, hash } from 'bcrypt';

// Initialize DynamoDB client
const client = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
}));

const TABLE_NAME = 'Users';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find user with valid reset token that hasn't expired
    const findUserCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'attribute_exists(resetToken) AND resetTokenExpires > :now',
      ExpressionAttributeValues: {
        ':now': new Date().toISOString()
      }
    });

    const result = await client.send(findUserCommand);

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const user = result.Items[0];

    // Verify the token matches
    const isValidToken = await compare(token, user.resetToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Update the user's password and clear the reset token
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        id: user.id
      },
      UpdateExpression: 'SET password = :password REMOVE resetToken, resetTokenExpires',
      ExpressionAttributeValues: {
        ':password': hashedPassword
      }
    });

    await client.send(updateCommand);

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
