import jwt from 'jsonwebtoken';

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (error) {
    return null;
  }
}