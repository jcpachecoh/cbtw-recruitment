import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    try {
      const decodedToken = verify(sessionCookie.value, JWT_SECRET) as {
        id: string;
        email: string;
        userName: string;
        userType: string;
        userStatus: string;
        exp: number;
      };

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        return NextResponse.json({ isValid: false }, { status: 401 });
      }

      // Return user information if session is valid
      return NextResponse.json({
        isValid: true,
        user: {
          id: decodedToken.id,
          email: decodedToken.email,
          userName: decodedToken.userName,
          userType: decodedToken.userType,
          userStatus: decodedToken.userStatus
        }
      });
    } catch (error) {
      // Token verification failed
      return NextResponse.json({ isValid: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
