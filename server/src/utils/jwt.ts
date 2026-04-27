import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

export const generateToken = (user: { id: string; email: string }): string => {
  const payload: UserPayload = {
    id: user.id,
    email: user.email
  };

  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as UserPayload;
};