import { Knex } from 'knex';
import { ProductCategory } from '../type.js';
import { db } from '../../../lib/knex/knex.js';

const CATEGORY_COLUMNS = ['id', 'restaurant_id', 'name', 'created_at', 'updated_at'];

export async function findCategoryByName(
  restaurantId: number,
  name: string,
): Promise<ProductCategory | null> {
  const row = await db('product_categories')
    .select(CATEGORY_COLUMNS)
    .where('restaurant_id', restaurantId)
    .where('name', name)
    .first();
  return row || null;
}

export async function findCategoriesByRestaurant(restaurantId: number): Promise<ProductCategory[]> {
  const rows = await db('product_categories')
    .select(CATEGORY_COLUMNS)
    .where('restaurant_id', restaurantId);
  return rows;
}

export async function createCategory(
  restaurantId: number,
  name: string,
  conn: Knex = db,
): Promise<ProductCategory> {
  const [row] = await conn('product_categories')
    .insert({
      restaurant_id: restaurantId,
      name,
    })
    .returning(CATEGORY_COLUMNS);
  return row;
}
