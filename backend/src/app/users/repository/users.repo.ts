import { db } from '../../../lib/knex/knex.js';
import { PhoneAlreadyInUseError } from '../error.js';
import { User } from '../types.js';

const USER_COLUMNS = [
  'id',
  'email',
  'phone',
  'name',
  'password_hash',
  'system_role',
  'created_at',
  'updated_at',
  'deleted_at',
];

export async function findUserByEmail(email: string): Promise<User | null> {
  const row = await db('users')
    .select(USER_COLUMNS)
    .where({ email })
    .whereNull('deleted_at')
    .first();
  return row || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const row = await db('users').select(USER_COLUMNS).where({ id }).whereNull('deleted_at').first();
  return row || null;
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const row = await db('users')
    .select(USER_COLUMNS)
    .where({ phone })
    .whereNull('deleted_at')
    .first();
  return row || null;
}

export async function findUserExistsByEmail(email: string): Promise<boolean> {
  const result = await db('users')
    .where({ email })
    .whereNull('deleted_at')
    .count('id as count')
    .first();
  return Number(result?.count) > 0;
}

export async function findUserExistsByEmailOrPhone(email: string, phone: string): Promise<boolean> {
  const result = await db('users')
    .where({ email })
    .orWhere({ phone })
    .whereNull('deleted_at')
    .count('id as count')
    .first();
  return Number(result?.count) > 0;
}

export async function createUser(user: Partial<User>): Promise<User> {
  const [row] = await db('users')
    .insert({
      email: user.email,
      phone: user.phone,
      name: user.name,
      password_hash: user.password_hash,
      system_role: user.system_role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    })
    .returning(USER_COLUMNS);
  return row;
}

export async function updateUserPassword(id: number, password: string) {
  await db('users').where({ id }).update({ password_hash: password });
}

export async function updateUser(
  id: number,
  data: Partial<{ name: string; phone: string }>,
): Promise<User> {
  if (data.phone) {
    const existing = await findUserByPhone(data.phone);
    if (existing && existing.id !== id) {
      throw PhoneAlreadyInUseError;
    }
  }
  const [row] = await db('users')
    .where({ id })
    .update({
      ...data,
      updated_at: new Date(),
    })
    .returning(USER_COLUMNS);

  return row;
}
