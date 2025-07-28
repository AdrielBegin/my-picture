// src/lib/users.ts
import bcrypt from 'bcryptjs';


const emailAdmin = process.env.EMAIL_ADMIN;
const emailPassword = process.env.EMAIL_PASSWORD;

export const users = [
  {
    id: 1,
    email: emailAdmin,
    password: bcrypt.hashSync(emailPassword!, 10),
    name: 'Usuário Teste'
  }
];

export function findUserByEmail(email: string) {
  return users.find((user) => user.email === email);
}
