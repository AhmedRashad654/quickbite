import { Knex } from 'knex';
import { db } from '../../../lib/knex/knex.js';
import { RestaurantMember } from '../type.js';
import { MemberStatus } from '../enums.js';

const MEMBER_COLUMNS = [
  'id',
  'restaurant_id',
  'user_id',
  'role_id',
  'status',
  'created_at',
  'updated_at',
];

export async function createRestaurantMember(
  data: Partial<RestaurantMember>,
  conn: Knex = db,
): Promise<RestaurantMember> {
  const query = conn || db;
  const [row] = await query('restaurant_members')
    .insert({
      restaurant_id: data.restaurant_id,
      user_id: data.user_id,
      role_id: data.role_id,
      status: data.status,
    })
    .returning(MEMBER_COLUMNS);
  return row;
}

export async function activateMemberByUserId(userId: number, conn: Knex = db): Promise<void> {
  const query = conn || db;
  await query('restaurant_members')
    .where('user_id', userId)
    .update({ status: MemberStatus.ACTIVE, updated_at: new Date() });
}

export async function findRestaurantsWithRole(
  userId: number,
): Promise<{ restaurant_id: number; member_id: number; role_name: string }[]> {
  const rows = await db('restaurant_members as rm')
    .select('rm.restaurant_id', 'rm.id as member_id', 'r.name as role_name')
    .leftJoin('roles as r', 'rm.role_id', 'r.id')
    .where('rm.user_id', userId)
    .andWhere('rm.status', MemberStatus.ACTIVE);

  return rows;
}

export async function findMembersByRestaurantId(restaurantId: number): Promise<unknown[]> {
  const rows = await db('restaurant_members as rm')
    .select(
      'rm.id',
      'rm.user_id',
      'u.email',
      'u.name',
      'u.phone',
      'r.name as role',
      'r.display_name as roleDisplayName',
      'rm.status',
    )
    .join('users as u', 'rm.user_id', 'u.id')
    .join('roles as r', 'rm.role_id', 'r.id')
    .where('rm.restaurant_id', restaurantId);
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    roleDisplayName: row.roleDisplayName,
    status: row.status,
  }));
}

export async function findMemberById(memberId: number): Promise<RestaurantMember | null> {
  const row = await db('restaurant_members').select(MEMBER_COLUMNS).where('id', memberId).first();
  return row || null;
}

export async function findMemberWithRoleName(
  memberId: number,
): Promise<{ member: RestaurantMember; roleName: string } | null> {
  const row = await db('restaurant_members as rm')
    .select(...MEMBER_COLUMNS.map((c) => `rm.${c}`), 'r.name as roleName')
    .join('roles as r', 'rm.role_id', 'r.id')
    .where('rm.id', memberId)
    .first();
  if (!row) return null;
  return { member: row, roleName: row.roleName };
}

export async function updateMember(
  memberId: number,
  data: { role_id?: number; status?: string },
  conn: Knex = db,
): Promise<void> {
  let updateData: Record<string, unknown> = {};
  if (data.role_id !== undefined) updateData.role_id = data.role_id;
  if (data.status !== undefined) updateData.status = data.status;
  await conn('restaurant_members').where('id', memberId).update(updateData);
}

export async function deleteMember(memberId: number, conn: Knex = db): Promise<void> {
  await conn('member_branches').where('member_id', memberId).delete();
  await conn('restaurant_members').where('id', memberId).delete();
}

export async function checkMemberExists(userId: number, restaurantId: number): Promise<boolean> {
  const result = await db('restaurant_members')
    .where({ user_id: userId, restaurant_id: restaurantId })
    .count('id as count')
    .first();
  return Number(result?.count) > 0;
}
