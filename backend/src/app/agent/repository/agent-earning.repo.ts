import { Knex } from 'knex';
import { AgentEarning, EarningsRange, InsertAgentEarningInput } from '../types.js';
import { db } from '../../../lib/knex/knex.js';

const AGENT_EARNING_COLUMNS = ['id', 'region', 'agent_id', 'order_id', 'amount', 'currency', 'earned_at'] as const;

export async function insertEarning(input: InsertAgentEarningInput, conn: Knex = db): Promise<AgentEarning | null> {
  const [row] = await conn('agent_earnings')
    .insert({
      agent_id: input.agent_id,
      order_id: input.order_id,
      amount: input.amount,
      currency: input.currency,
    })
    .onConflict('order_id')
    .ignore()
    .returning(AGENT_EARNING_COLUMNS as unknown as string[]);
  return row || null;
}

export async function listByAgent(
  agentId: number,
  range: EarningsRange,
  limit: number,
  conn: Knex = db,
): Promise<AgentEarning[]> {
  const rows = await conn('agent_earnings')
    .select(AGENT_EARNING_COLUMNS as unknown as string[])
    .where('agent_id', agentId)
    .where('earned_at', '>=', range.from)
    .where('earned_at', '<', range.to)
    .orderBy('earned_at', 'desc')
    .limit(limit);
  return rows;
}

export async function sumByAgent(agentId: number, range: EarningsRange, conn: Knex = db): Promise<number> {
  const row = await conn('agent_earnings')
    .where('agent_id', agentId)
    .where('earned_at', '>=', range.from)
    .where('earned_at', '<', range.to)
    .sum<{ sum: string | null }>({ sum: 'amount' })
    .first();
  return Number(row?.sum ?? 0);
}
