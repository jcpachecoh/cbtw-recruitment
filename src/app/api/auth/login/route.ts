import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';
import { useSetRecoilState } from 'recoil';
import { onlineUserState } from '../../../recoilContextProvider';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy',
  },
}));

const TABLE_NAME = 'Users';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        message: 'Missing email or password',
      }, { status: 400 });
    }

    // Find user by email
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      },
      ProjectionExpression: 'id, email, password, userName, userType, userStatus'
    });

    const queryResponse = await client.send(command);
    const user = queryResponse.Items?.[0];

    if (!user) {
      return NextResponse.json({
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    // Create session token
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        userName: user.userName,
        userType: user.userType
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create response with session cookie
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        userType: user.userType,
        userStatus: user.userStatus
      }
    });

    // Set cookie in response
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    const setUser = useSetRecoilState(onlineUserState);
    setUser(user);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
