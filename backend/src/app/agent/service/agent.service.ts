import { injectable, inject } from 'tsyringe';
import { Server as IoServer } from 'socket.io';
import { TOKENS } from '../../../lib/di/tokens.js';
import { container } from '../../../lib/di/container.js';
import { AssignmentService } from '../../assignment/service/assignment.service.js';
import { OrderStatus } from '../../order/enums.js';
import { AgentEarningsResponseDTO, DeliveryTaskResponseDTO } from '../dto/agent.response.dto.js';
import { findBranchById, findBranchsByIds } from '../../branch/repository/branch.repo.js';
import { findAgentTasks, findOrderByPublicId, updateOrderStatus } from '../../order/repository/order.repo.js';
import { NotYourTaskError } from '../errors.js';
import { db } from '../../../lib/knex/knex.js';
import { OrderStatusResponseDTO } from '../../order/dto/order.response.dto.js';
import { listByAgent, sumByAgent } from '../repository/agent-earning.repo.js';
import { SettlementService } from './settlement.service.js';

const TASK_LIST_LIMIT = 50;

@injectable()
export class AgentService {
  constructor(
    @inject(TOKENS.AssignmentService) private readonly assignment: AssignmentService,
    @inject(TOKENS.SettlementService) private readonly settlement: SettlementService,
  ) {}

  private get io(): IoServer {
    return container.resolve<IoServer>(TOKENS.WsServer);
  }

  async accept(publicId: string, agentId: number): Promise<DeliveryTaskResponseDTO> {
    return this.assignment.claim(publicId, agentId);
  }

  async reject(publicId: string, agentId: number): Promise<void> {
    await this.assignment.reject(publicId, agentId);
  }

  /** picked / delivered transitions for the assigned agent. */
  async transition(
    publicId: string,
    agentId: number,
    target: OrderStatus,
  ): Promise<DeliveryTaskResponseDTO> {
    if (target === OrderStatus.DELIVERED) {
      const updated = await this.settlement.settleDelivered(publicId, agentId);
      const branch = await findBranchById(updated.branch_id).catch(() => null);
      return DeliveryTaskResponseDTO.from(updated, branch ?? undefined);
    }

    if (target !== OrderStatus.PICKED) {
      throw new Error(`agent cannot transition to ${target}`);
    }

    const order = await findOrderByPublicId(publicId);
    if (!order) throw new Error('OrderNotFound');
    if (order.delivery_agent_id !== agentId) throw NotYourTaskError;
    if (order.status !== OrderStatus.ASSIGNED) throw new Error('OrderNotInAssignedState');

    const trx = await db.transaction();
    let updated;
    try {
      updated = await updateOrderStatus(publicId, OrderStatus.PICKED, 'picked_at', trx);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
    const statusDto = OrderStatusResponseDTO.from(updated);
    this.io.to(`customer:${updated.customer_id}`).emit('order.status_changed', statusDto);
    this.io.to(`branch:${updated.branch_id}`).emit('order.status_changed', statusDto);
    const branch = await findBranchById(updated.branch_id).catch(() => null);
    return DeliveryTaskResponseDTO.from(updated, branch ?? undefined);
  }

  async listTasks(agentId: number, statusFilter?: string): Promise<DeliveryTaskResponseDTO[]> {
    const statuses = statusFilter ? [statusFilter] : [OrderStatus.ASSIGNED, OrderStatus.PICKED];
    const orders = await findAgentTasks(agentId, statuses, TASK_LIST_LIMIT);
    // Single batch lookup for branch enrichment — at most one network
    // round-trip regardless of how many unique branches the agent has
    // tasks at. Cache hits per branch are also served from this call.
    const branchs = await findBranchsByIds(orders.map((o) => o.branch_id));
    const enriched = new Map<number, { lat: number; lng: number; name: string; addressText: string }>();
    for (const b of branchs) {
      enriched.set(b.id, { lat: b.lat, lng: b.lng, name: b.label, addressText: b.address_text });
    }
    return orders.map((o) => DeliveryTaskResponseDTO.from(o, enriched.get(o.branch_id)));
  }

  async earnings(agentId: number, from: Date, to: Date): Promise<AgentEarningsResponseDTO> {
    const items = await listByAgent(agentId, { from, to }, 100);
    const sum = await sumByAgent(agentId, { from, to });
    return AgentEarningsResponseDTO.from(from, to, items, sum);
  }
}
