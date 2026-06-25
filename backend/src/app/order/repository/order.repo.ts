import { Knex } from 'knex';
import {
  CreateOrderInput,
  ListCustomerOrdersFilter,
  ListRestaurantBranchOrdersFilter,
  ListResult,
  Order,
} from '../types.js';
import { OrderStatus } from '../enums.js';
import {
  applyCursorPagination,
  applyFilters,
  buildPaginationResult,
  FilterParams,
  PaginationParams,
} from '../../../lib/http/pagination/cursor-pagination.js';
import { db } from '../../../lib/knex/knex.js';

export const ORDER_COLUMNS = [
  'id',
  'public_id',
  'country_code',
  'restaurant_id',
  'branch_id',
  'customer_id',
  'customer_address_id',
  'delivery_lat',
  'delivery_lng',
  'delivery_address_text_snapshot',
  'branch_lat',
  'branch_lng',
  'order_type',
  'status',
  'subtotal',
  'delivery_fee',
  'service_fee',
  'total',
  'commission',
  'currency',
  'payment_method',
  'delivery_agent_id',
  'created_at',
  'updated_at',
  'accepted_at',
  'rejected_at',
  'ready_at',
  'assigned_at',
  'picked_at',
  'delivered_at',
  'cancelled_at',
];

export async function createOrder(order: CreateOrderInput, conn: Knex): Promise<Order> {
  const [row] = await conn('orders').insert(order).returning(ORDER_COLUMNS);
  return row;
}

export async function findOrderByPublicId(publicId: string, conn: Knex = db): Promise<Order | null> {
  const row = await conn('orders as o')
    .join('restaurants as r', 'r.id', 'o.restaurant_id')
    .select([...ORDER_COLUMNS.map((c) => `o.${c}`), 'r.owner_id as restaurant_owner_id'])
    .where('o.public_id', publicId)
    .first();

  if (!row) return null;

  return {
    ...row,
    restaurant_owner_id: Number(row.restaurant_owner_id),
  };
}

export async function findReadyUnassigned(limit: number, conn: Knex = db): Promise<Order[]> {
  const rows = await conn('orders')
    .select(ORDER_COLUMNS)
    .where({
      status: 'ready',
      order_type: 'delivery',
    })
    .whereNull('delivery_agent_id')
    .orderBy('created_at', 'asc')
    .limit(limit);
  return rows;
}

export async function claimReadyOrderForAgent(publicId: string, agentId: number, conn: Knex): Promise<Order | null> {
  const [row] = await conn('orders')
    .where({ public_id: publicId, status: 'ready' })
    .whereNull('delivery_agent_id')
    .update({
      status: 'assigned',
      delivery_agent_id: agentId,
      assigned_at: conn.fn.now(),
      updated_at: conn.fn.now(),
    })
    .returning(ORDER_COLUMNS as unknown as string[]);
  return row || null;
}

export async function releaseAssignedOrderToReady(publicId: string, agentId: number, conn: Knex): Promise<number> {
  const updated = await conn('orders')
    .where({
      public_id: publicId,
      delivery_agent_id: agentId,
      status: 'assigned',
    })
    .update({
      status: 'ready',
      delivery_agent_id: null,
      assigned_at: null,
      updated_at: conn.fn.now(),
    });

  return updated;
}

export async function findAgentTasks(
  agentId: number,
  statuses: string[] | undefined,
  limit: number,
  conn: Knex = db,
): Promise<Order[]> {
  let q = conn('orders')
    .select(ORDER_COLUMNS as unknown as string[])
    .where('delivery_agent_id', agentId);
  if (statuses && statuses.length > 0) q = q.whereIn('status', statuses);
  const rows = await q.orderBy('assigned_at', 'desc').limit(limit);
  return rows;
}

export async function updateOrderCommission(publicId: string, commission: number, conn: Knex): Promise<void> {
  await conn('orders').where({ public_id: publicId }).update({ commission, updated_at: conn.fn.now() });
}

export async function updateOrderStatus(
  publicId: string,
  status: OrderStatus,
  stampColumn: string | null,
  conn: Knex = db,
): Promise<Order> {
  const update: Record<string, unknown> = {
    status,
    updated_at: conn.fn.now(),
  };
  if (stampColumn) {
    update[stampColumn] = conn.fn.now();
  }
  const [row] = await conn('orders')
    .where({ public_id: publicId })
    .update(update)
    .returning(ORDER_COLUMNS as unknown as string[]);
  return row;
}

export async function findOrdersByCustomer(
  filter: ListCustomerOrdersFilter,
  pagination: PaginationParams,
  conn: Knex = db,
): Promise<ListResult<Order>> {
  const query = conn('orders')
    .select(ORDER_COLUMNS)
    .where('customer_id', filter.customerId)
    .where('created_at', '>=', filter.yearStart)
    .where('created_at', '<', filter.yearEnd);

  const rows = await applyCursorPagination(query, pagination);
  const result = buildPaginationResult(rows, pagination.limit, pagination.sortBy);
  return { data: result.data as Order[], meta: result.meta };
}

export async function findOrdersByRestaurantBranch(
  filter: ListRestaurantBranchOrdersFilter,
  pagination: PaginationParams,
  extraFilters: FilterParams[],
  conn: Knex,
): Promise<Order> {
  let query = conn('orders')
    .select(ORDER_COLUMNS as unknown as string[])
    .where('restaurant_id', filter.restaurantId)
    .where('branch_id', filter.branchId);

  if (filter.status) query = query.where('status', filter.status);
  if (filter.from) query = query.where('created_at', '>=', filter.from);
  if (filter.to) query = query.where('created_at', '<', filter.to);

  query = applyFilters(query, extraFilters);
  const rows = await applyCursorPagination(query, pagination);
  return rows;
}
