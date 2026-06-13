import { Knex } from 'knex';
import { InsertOrderItemInput, OrderItem } from '../types.js';

export const ORDER_ITEM_COLUMNS = [
  'id',
  'order_id',
  'product_id',
  'quantity',
  'unit_price_snapshot',
  'name_snapshot',
  'image_url_snapshot',
  'line_total',
  'created_at',
];

export async function bulkInsertItems(orderItems: InsertOrderItemInput[], conn: Knex): Promise<OrderItem[]> {
  if (orderItems.length === 0) return [];
  const rows = await conn('order_items')
    .insert(orderItems.map((item) => item))
    .returning(ORDER_ITEM_COLUMNS);
  return rows;
}

export async function findItemsByOrderIds(orderIds: number[], conn: Knex): Promise<OrderItem[]> {
  if (orderIds.length === 0) return [];
  const rows = await conn('order_items')
    .select(ORDER_ITEM_COLUMNS as unknown as string[])
    .whereIn('order_id', orderIds)
    .orderBy('id', 'asc');
  return rows;
}

export async function countItemsByOrderIds(orderIds: number[], conn: Knex): Promise<Map<number, number>> {
    const out = new Map<number, number>();
    if (orderIds.length === 0) return out;
    const rows = await conn("order_items")
        .select("order_id")
        .count<{order_id: string; count: string}[]>("* as count")
        .whereIn("order_id", orderIds)
        .groupBy("order_id");
    for (const r of rows) out.set(Number(r.order_id), Number(r.count));
    return out;
}
