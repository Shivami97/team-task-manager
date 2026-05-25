import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "e972986427dbbe51859c2bb0e4a7372cf931b67f13919c011e4bf648c69cb5a8";

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}
