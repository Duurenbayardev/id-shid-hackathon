import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export function generateToken(payload = { name: 'admin' }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setTokenCookie(response, token) {
  response.cookies.set('auth_token', token, {
    maxAge: '10s',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'strict'
  });
}

export function removeTokenCookie(response) {
  response.cookies.set('auth_token', '', {
    maxAge: -1,
    path: '/',
  });
}

export function getTokenFromRequest(request) {
  return request.cookies.get('auth_token')?.value;
}