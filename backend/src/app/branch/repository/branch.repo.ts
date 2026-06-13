import { Knex } from 'knex';
import { db } from '../../../lib/knex/knex.js';
import { Branch, BranchWithRestaurant } from '../type.js';
import { NoFieldsToUpdateError } from '../errors.js';

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
  'delivery_radius',
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
      delivery_radius: data.delivery_radius,
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

export async function updateBranch(id: number, data: Partial<Branch>): Promise<Branch> {
  const mapped: Record<string, unknown> = {};
  if (data.label !== undefined) mapped.label = data.label;
  if (data.address_text !== undefined) mapped.address_text = data.address_text;
  if (data.lat !== undefined) mapped.lat = data.lat;
  if (data.lng !== undefined) mapped.lng = data.lng;
  if (data.opens_at !== undefined) mapped.opens_at = data.opens_at;
  if (data.closes_at !== undefined) mapped.closes_at = data.closes_at;
  if (data.delivery_radius !== undefined) mapped.delivery_radius = data.delivery_radius;
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
       r.name,
       r.logo_url
       FROM restaurant_branches b JOIN restaurants r ON  b.restaurant_id = r.id
       WHERE b.is_active = true AND r.status ='active'
       AND ST_DWithin(b.location, ST_MakePoint(?, ?)::geography, b.delivery_radius*1000)
    `,
    [lng, lat],
  );

  return result.rows;
}

export async function findBranchWithRestaurant(branchId: number): Promise<BranchWithRestaurant | null> {
  const row = await db('restaurant_branches as b')
    .join('restaurants as r', 'b.restaurant_id', 'r.id')
    .select([
      'b.id',
      'b.restaurant_id',
      'b.is_active',
      'b.accept_orders',
      'p.delivery_fee',
      'p.country_code',
      'p.currency',
      'p.lat',
      'p.lng',
      'p.label',
      'p.address_text',
      'r.status as restaurant_status',
    ])
    .where('b.id', branchId)
    .first();
  return row || null;
}
