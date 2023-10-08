import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Remove 'Bearer ' from string
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.next();
  }

  // TODO: Edge runtime doesn't support jwks-rsa (setImmediate)

  return NextResponse.next();
}

export const config = {
  // matcher: '/plaid/:path*'
};
