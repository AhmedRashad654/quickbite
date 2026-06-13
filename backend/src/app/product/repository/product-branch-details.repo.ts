import { Knex } from 'knex';
import { db } from '../../../lib/knex/knex.js';
import { NoFieldsToUpdateError } from '../errors.js';
import { BranchProductRow, ProductBranchDetails } from '../type.js';

const PBD_COLUMNS = ['id', 'branch_id', 'product_id', 'price', 'stock', 'is_available'];

export async function updateBranchProductDetails(
  branchId: number,
  productId: number,
  data: { price?: number; stock?: number; is_available?: boolean },
): Promise<ProductBranchDetails> {
  const updateData: Record<string, unknown> = {};
  if (data.price !== undefined) updateData.price = data.price;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (data.is_available !== undefined) updateData.is_available = data.is_available;
  if (Object.keys(updateData).length === 0) {
    throw NoFieldsToUpdateError;
  }
  const [row] = await db('product_branch_details')
    .where('branch_id', branchId)
    .where('product_id', productId)
    .update(updateData)
    .returning(PBD_COLUMNS);
  return row;
}

export async function getProductsByBranchAndIds(branchId: number, productIds: number[]): Promise<BranchProductRow[]> {
  const rows = await db('product_branch_details as pbd')
    .join('products as p', 'p.id', 'pbd.product_id')
    .where('pbd.branch_id', branchId)
    .whereIn('pbd.product_id', productIds)
    .whereNull('p.deleted_at')
    .select('pbd.product_id', 'p.name', 'p.image_url', 'pbd.price', 'pbd.stock', 'pbd.is_available');

  return rows;
}

export async function getBranchProductsForUpdate(branchId: number, productIds: number[], conn: Knex.Transaction) {
  const rows = await conn('product_branch_details')
    .where('branch_id', branchId)
    .whereIn('product_id', productIds)
    .select('product_id', 'stock', 'is_available')
    .forUpdate();
  return rows;
}
