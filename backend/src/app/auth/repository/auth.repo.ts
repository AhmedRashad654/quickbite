import { db } from '../../../lib/knex/knex.js';
import { PasswordReset } from '../type.js';

const PASSWORD_RESET_COLUMNS = [
  'id',
  'user_id',
  'otp_hash',
  'expires_at',
  'consumed_at',
  'created_at',
];
export async function createPasswordReset(passwordReset: Partial<PasswordReset>) {
  await db('password_resets').insert({
    user_id: passwordReset.user_id,
    otp_hash: passwordReset.otp_hash,
    expires_at: passwordReset.expires_at,
  });
}

export async function findLatestPasswordResetByUserId(
  userId: number,
): Promise<PasswordReset | null> {
  const row = await db('password_resets')
    .select(PASSWORD_RESET_COLUMNS)
    .where('user_id', userId)
    .whereNull('consumed_at')
    .orderBy('id', 'desc')
    .first();
  return row || null;
}

export async function updatePasswordResetConsumedAt(id: number) {
  await db('password_resets').where('id', id).update({
    consumed_at: new Date(),
  });
}
