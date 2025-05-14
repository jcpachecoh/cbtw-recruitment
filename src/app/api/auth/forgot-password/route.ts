import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';

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

// Function to generate a random reset token
const generateResetToken = () => {
  return randomBytes(32).toString('hex');
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a reset token and its expiration (24 hours from now)
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash the token before storing it
    const hashedToken = await hash(resetToken, 10);

    // Find the user by email
    const findUserCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    });

    const userResult = await client.send(findUserCommand);

    if (!userResult.Items || userResult.Items.length === 0) {
      // Return success even if user not found (to prevent email enumeration)
      return NextResponse.json(
        { message: 'If an account exists with this email, you will receive password reset instructions.' },
        { status: 200 }
      );
    }

    const user = userResult.Items[0];

    // Update the user record with the reset token and expiry
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        id: user.id
      },
      UpdateExpression: 'SET resetToken = :token, resetTokenExpires = :expiry',
      ExpressionAttributeValues: {
        ':token': hashedToken,
        ':expiry': resetTokenExpiry.toISOString()
      }
    });

    await client.send(updateCommand);

    // In a real application, you would send an email here with the reset link
    // For development, we'll just log the token
    console.log(`Reset token for ${email}: ${resetToken}`);
    // TODO: Implement email sending functionality
    const resetLink = `/reset-password?token=${resetToken}`;

    return NextResponse.json(
      { message: 'If an account exists with this email, you will receive password reset instructions, follow the link: ' + resetLink },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
