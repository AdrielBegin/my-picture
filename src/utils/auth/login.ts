// src/utils/auth/login.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/lib/users';

const SECRET_KEY = process.env.JWT_SECRET || 'segredo-super-seguro';

export async function login(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user) throw new Error('Usuário não encontrado');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Senha incorreta');

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: '1d',
  });

  return token;
}
