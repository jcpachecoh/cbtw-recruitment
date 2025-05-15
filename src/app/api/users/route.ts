import { NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

import { ensureTableExists } from '../utils/dynamo';

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

export async function GET() {
  try {
    await ensureTableExists(TABLE_NAME);
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      ProjectionExpression: 'id, email, userName, userType, userStatus, lastLoginTime, createdAt, department, userRole, avatarUrl'
    });

    const response = await client.send(command);

    return NextResponse.json({
      message: 'Users retrieved successfully',
      data: response.Items
    }, { status: 200 });

  } catch (error) {
    console.error('Error retrieving users:', error);
    return NextResponse.json({
      message: 'Error retrieving users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTableExists(TABLE_NAME);
    const data = await request.json();

    // Validate required fields
    if (!data.email || !data.password || !data.userName || !data.userType) {
      return NextResponse.json({
        message: 'Missing required fields',
      }, { status: 400 });
    }

    // Check if email already exists using scan
    const emailCheck = await client.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': data.email
      }
    }));

    if (emailCheck.Items && emailCheck.Items.length > 0) {
      return NextResponse.json({
        message: 'Email already exists',
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const timestamp = new Date().toISOString();
    const id = uuidv4();

    const item = {
      id,
      email: data.email,
      password: hashedPassword,
      userName: data.userName,
      userType: data.userType,
      userStatus: data.userStatus || 'active',
      lastLoginTime: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      department: data.department || null,
      role: data.role || null,
      avatarUrl: data.avatarUrl || null,
      phoneNumber: data.phoneNumber || null,
      preferences: data.preferences || {},
      failedLoginAttempts: 0,
      lastPasswordChange: timestamp
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)'
    });

    await client.send(command);

    // Don't return the password in the response
    const { password, ...userWithoutPassword } = item;

    return NextResponse.json({
      message: 'User created successfully',
      data: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureTableExists(TABLE_NAME);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        message: 'Missing user ID',
      }, { status: 400 });
    }

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ReturnValues: 'ALL_OLD'
    });

    const response = await client.send(command);

    if (!response.Attributes) {
      return NextResponse.json({
        message: 'User not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      data: {
        id,
        email: response.Attributes.email,
        name: response.Attributes.name
      }
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureTableExists(TABLE_NAME);
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({
        message: 'Missing user ID',
      }, { status: 400 });
    }

    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString()
    };
    const expressionAttributeNames: Record<string, string> = {};

    // Build dynamic update expression
    const updatableFields = [
      'userName', 'userStatus', 'department', 'userRole', 'avatarUrl',
      'phoneNumber', 'preferences', 'userType'
    ];

    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeValues[`:${field}`] = data[field];
        expressionAttributeNames[`#${field}`] = field;
      }
    });

    // Handle password update separately
    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      updateExpression += ', #password = :password, #lastPasswordChange = :lastPasswordChange';
      expressionAttributeValues[':password'] = hashedPassword;
      expressionAttributeValues[':lastPasswordChange'] = new Date().toISOString();
      expressionAttributeNames['#password'] = 'password';
      expressionAttributeNames['#lastPasswordChange'] = 'lastPasswordChange';
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: data.id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    });

    const response = await client.send(command);

    // Don't return the password in the response
    if (response.Attributes) {
      const { password, ...userWithoutPassword } = response.Attributes;
      return NextResponse.json({
        message: 'User updated successfully',
        data: userWithoutPassword
      });
    }

    return NextResponse.json({
      message: 'User updated successfully',
      data: null
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
