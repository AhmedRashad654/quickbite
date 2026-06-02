import { db } from "../../../lib/knex/knex.js";
import { NoFieldsToUpdateError } from "../errors.js";
import { Product } from "../type.js";

const PRODUCT_COLUMNS = [
  'id',
  'name',
  'description',
  'image_url',
  'restaurant_id',
  'category_id',
  'created_at',
  'updated_at',
  'deleted_at',
];

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const [row] = await db('products')
    .insert({
      name: data.name,
      description: data.description,
      image_url: data.image_url,
      restaurant_id: data.restaurant_id,
      category_id: data.category_id,
    })
    .returning(PRODUCT_COLUMNS);
  return row;
}

export async function findProductById(id: number): Promise<Product | null> {
  const row = await db('products')
    .select(PRODUCT_COLUMNS)
    .where('id', id)
    .whereNull('deleted_at')
    .first();
  return row || null;
}

export async function findProductsByRestaurant(restaurantId: number): Promise<Product[]> {
  const rows = await db('products')
    .select(PRODUCT_COLUMNS)
    .where('restaurant_id', restaurantId)
    .whereNull('deleted_at');
  return rows;
}

export async function findProductsByBranch(branchId: number) {
  const rows = await db('products as p')
    .join('product_branch_details as pbd', 'p.id', 'pbd.product_id')
    .leftJoin('product_categories as pc', 'p.category_id', 'pc.id')
    .where('pbd.branch_id', branchId)
    .whereNull('p.deleted_at')
    .select(
      'p.id',
      'p.name',
      'p.description',
      'p.image_url',
      'p.restaurant_id',
      'p.category_id',
      'pc.name as category_name',
      'pbd.price',
      'pbd.stock',
      'pbd.is_available',
    );
  return rows;
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.image_url !== undefined) updateData.image_url = data.image_url;
  if (data.category_id !== undefined) updateData.category_id = data.category_id;

  if(Object.keys(updateData).length === 0) {
    throw NoFieldsToUpdateError;
  }

  const [row] = await db('products')
    .where('id', id)
    .update(updateData)
    .returning(PRODUCT_COLUMNS);
  return row;
}
