import { Knex } from 'knex';
import { db } from '../../../lib/knex/knex.js';
import { Branch } from '../type.js';
import { NoFieldsToUpdateError } from '../errors.js';
import { Restaurant } from '../../restaurant/type.js';
import { env } from '../../../lib/config/env.js';

const BRANCH_COLUMNS = [
  'id',
  'restaurant_id',
  'country_code',
  'address_text',
  'label',
  'lat',
  'lng',
  'is_active',
  'opens_at',
  'closes_at',
  'accept_orders',
  'delivery_fee',
  'currency',
  'commission',
  'created_at',
  'updated_at',
];

export async function createBranch(data: Partial<Branch>, conn: Knex = db): Promise<Branch> {
  const [row] = await conn('restaurant_branches')
    .insert({
      restaurant_id: data.restaurant_id,
      country_code: data.country_code,
      address_text: data.address_text,
      label: data.label,
      lat: data.lat,
      lng: data.lng,
      is_active: data.is_active,
      opens_at: data.opens_at,
      closes_at: data.closes_at,
      accept_orders: data.accept_orders,
      currency: data.currency,
      commission: data.commission,
    })
    .returning(BRANCH_COLUMNS);

  return row;
}

export async function findBranchesByRestaurant(restaurantId: number): Promise<Branch[]> {
  const rows = await db('restaurant_branches').select(BRANCH_COLUMNS).where('restaurant_id', restaurantId);
  return rows;
}

export async function findBranchById(id: number): Promise<Branch | null> {
  const row = await db('restaurant_branches').select(BRANCH_COLUMNS).where('id', id).first();
  return row || null;
}

export async function findBranchByIdWithRestaurant(branchId: number): Promise<Partial<Branch> & Partial<Restaurant>> {
  const row = await db('restaurant_branches as rb')
    .join('restaurants as r', 'rb.restaurant_id', 'r.id')
    .where('rb.id', branchId)
    .andWhere('rb.is_active', true)
    .andWhere('r.status', 'active')
    .select(
      'rb.id as branch_id',
      'rb.label as branch_name',
      'rb.address_text',
      'rb.country_code',
      'rb.is_active',
      'rb.opens_at',
      'rb.closes_at',
      'rb.accept_orders',
      'rb.currency',
      'rb.delivery_fee',
      'r.name as restaurant_name',
      'r.logo_url',
      'r.status as status_restaurant',
    )
    .first();
  return row || null;
}

export async function findBranchsByIds(ids: number[]): Promise<Branch[]> {
  const rows = await db('restaurant_branches').select(BRANCH_COLUMNS).whereIn('id', ids).first();
  return rows;
}

export async function updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
  const mapped: Record<string, unknown> = {};
  if (data.label !== undefined) mapped.label = data.label;
  if (data.address_text !== undefined) mapped.address_text = data.address_text;
  if (data.lat !== undefined) mapped.lat = data.lat;
  if (data.lng !== undefined) mapped.lng = data.lng;
  if (data.opens_at !== undefined) mapped.opens_at = data.opens_at;
  if (data.closes_at !== undefined) mapped.closes_at = data.closes_at;
  if (data.currency !== undefined) mapped.currency = data.currency;
  if (data.accept_orders !== undefined) mapped.accept_orders = data.accept_orders;
  if (Object.keys(mapped).length === 0) {
    throw NoFieldsToUpdateError;
  }
  const [row] = await db('restaurant_branches')
    .where('id', id)
    .update({
      ...mapped,
      updated_at: new Date(),
    })
    .returning(BRANCH_COLUMNS);
  return row;
}

export async function updateBranchStatus(
  id: number,
  data: { is_active?: boolean; commission?: number },
): Promise<Branch> {
  const [row] = await db('restaurant_branches')
    .where('id', id)
    .update({
      is_active: data.is_active,
      commission: data.commission,
      updated_at: new Date(),
    })
    .returning(BRANCH_COLUMNS);
  return row;
}

export async function getRestaurantIdByBranch(branchId: number): Promise<number | null> {
  const branch = await db('restaurant_branches').select('restaurant_id').where('id', branchId).first();
  return branch ? branch.restaurant_id : null;
}

export async function findNearbyBranches(lat: number, lng: number): Promise<Branch[]> {
  const radiusMeters = env.delivery.radiusMeters || 5000;
  const result = await db.raw(
    `
       SELECT 
       b.id,
       b.restaurant_id,
       b.address_text,
       b.label,
       b.lat,
       b.lng,
       b.is_active,
       b.accept_orders,
       b.currency,
       b.opens_at,
       b.closes_at,
       r.name,
       r.logo_url
       FROM restaurant_branches b JOIN restaurants r ON  b.restaurant_id = r.id
       WHERE b.is_active = true AND r.status ='active'
       AND ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, ?)
    `,
    [lng, lat, radiusMeters],
  );

  return result.rows;
}

export async function findClosestBranches(lat: number, lng: number, limit: number = 5): Promise<Branch[]> {
  const result = await db.raw(
    `
       SELECT 
         b.id,
         b.restaurant_id,
         b.address_text,
         b.label,
         b.lat,
         b.lng,
         b.is_active,
         b.accept_orders,
         b.currency,
         b.opens_at,
         b.closes_at,
         r.name,
         r.logo_url,
         ST_Distance(b.location, ST_MakePoint(?, ?)::geography) as distance_meters
       FROM restaurant_branches b 
       JOIN restaurants r ON b.restaurant_id = r.id
       WHERE b.is_active = true 
         AND r.status = 'active'
       ORDER BY b.location <-> ST_MakePoint(?, ?)::geography
       LIMIT ?
    `,
    [lng, lat, lng, lat, limit],
  );

  return result.rows;
}

export async function findBranchWithRestaurant(
  branchId: number,
): Promise<(Branch & { restaurant_status: string }) | null> {
  const row = await db('restaurant_branches as b')
    .join('restaurants as r', 'b.restaurant_id', 'r.id')
    .select([
      'b.id',
      'b.restaurant_id',
      'b.is_active',
      'b.accept_orders',
      'b.delivery_fee',
      'b.country_code',
      'b.currency',
      'b.opens_at',
      'b.closes_at',
      'b.lat',
      'b.lng',
      'b.label',
      'b.address_text',
      'r.status as restaurant_status',
    ])
    .where('b.id', branchId)
    .first();
  return row || null;
}
