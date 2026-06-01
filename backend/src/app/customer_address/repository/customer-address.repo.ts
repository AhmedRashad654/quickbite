import { db } from '../../../lib/knex/knex.js';
import { NoFieldsToUpdateError } from '../errors.js';
import { CustomerAddress } from '../type.js';

const ADDRESS_COLUMNS = [
  'id',
  'user_id',
  'label',
  'country',
  'city',
  'street',
  'building',
  'apartment_number',
  'type',
  'lat',
  'lng',
  'is_default',
];

export async function findAddressesByUserId(userId: number): Promise<CustomerAddress[]> {
  const rows = await db('customer_addresses').select(ADDRESS_COLUMNS).where('user_id', userId);
  return rows;
}

export async function findAddressById(id: number): Promise<CustomerAddress | null> {
  const row = await db('customer_addresses').select(ADDRESS_COLUMNS).where('id', id).first();

  return row || null;
}

export async function createAddress(address: Partial<CustomerAddress>): Promise<CustomerAddress> {
  const [row] = await db('customer_addresses')
    .insert({
      user_id: address.user_id,
      label: address.label,
      country: address.country,
      city: address.city,
      street: address.street,
      building: address.building,
      apartment_number: address.apartment_number,
      type: address.type,
      lat: address.lat,
      lng: address.lng,
      is_default: address.is_default,
    })
    .returning(ADDRESS_COLUMNS);

  return row;
}

export async function updateAddress(
  id: number,
  data: Record<string, unknown>,
): Promise<CustomerAddress> {
  const mapped: Record<string, unknown> = {};
  if (data.label !== undefined) mapped.label = data.label;
  if (data.country !== undefined) mapped.country = data.country;
  if (data.city !== undefined) mapped.city = data.city;
  if (data.street !== undefined) mapped.street = data.street;
  if (data.building !== undefined) mapped.building = data.building;
  if (data.apartment_number !== undefined) mapped.apartment_number = data.apartment_number;
  if (data.type !== undefined) mapped.type = data.type;
  if (data.lat !== undefined) mapped.lat = data.lat;
  if (data.lng !== undefined) mapped.lng = data.lng;
  if (data.is_default !== undefined) mapped.is_default = data.is_default;
  if(Object.keys(mapped).length === 0) {
    throw NoFieldsToUpdateError;
  }
  const [row] = await db('customer_addresses')
    .where('id', id)
    .update(mapped)
    .returning(ADDRESS_COLUMNS);

  return row;
}

export async function deleteAddress(id: number): Promise<void> {
  await db('customer_addresses').where('id', id).delete();
}

export async function clearDefaultByUserId(userId: number): Promise<void> {
  await db('customer_addresses')
    .where('user_id', userId)
    .where('is_default', true)
    .update({ is_default: false });
}
