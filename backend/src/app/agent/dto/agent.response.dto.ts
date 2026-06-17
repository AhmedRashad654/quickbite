import { Currency } from '../../branch/enums.js';
import { OrderStatus } from '../../order/enums.js';
import { Order } from '../../order/types.js';
import { AgentEarning } from '../types.js';

export class DeliveryTaskResponseDTO {
  orderId!: string; // public_id
  status!: OrderStatus;
  pickup!: {
    branchId: number;
    lat: number | null;
    lng: number | null;
    name: string | null;
    addressText: string | null;
  };
  dropoff!: { lat: number; lng: number; addressText: string };
  total!: number;
  currency!: Currency;
  paymentMethod!: string;
  assignedAt!: string | null;
  pickedAt!: string | null;
  deliveredAt!: string | null;

  static from(
    order: Order,
    branch?: any,
  ): DeliveryTaskResponseDTO {
    const dto = new DeliveryTaskResponseDTO();
    dto.orderId = order.public_id;
    dto.status = order.status;
    dto.pickup = {
      branchId: order.branch_id,
      lat: branch ? branch.lat : null,
      lng: branch ? branch.lng : null,
      name: branch ? branch.name : null,
      addressText: branch ? branch.addressText : null,
    };
    dto.dropoff = {
      lat: order.delivery_lat,
      lng: order.delivery_lng,
      addressText: order.delivery_address_text_snapshot,
    };
    dto.total = order.total;
    dto.currency = order.currency;
    dto.paymentMethod = order.payment_method;
    dto.assignedAt = order.assigned_at ? order.assigned_at.toISOString() : null;
    dto.pickedAt = order.picked_at ? order.picked_at.toISOString() : null;
    dto.deliveredAt = order.delivered_at ? order.delivered_at.toISOString() : null;
    return dto;
  }
}

export class AgentEarningItemDTO {
  orderId!: number;
  amount!: number;
  currency!: string;
  earnedAt!: string;

  static from(e: AgentEarning): AgentEarningItemDTO {
    const dto = new AgentEarningItemDTO();
    dto.orderId = e.order_id;
    dto.amount = e.amount;
    dto.currency = e.currency;
    dto.earnedAt = e.earned_at.toISOString();
    return dto;
  }
}

export class AgentEarningsResponseDTO {
  range!: { from: string; to: string };
  totals!: { count: number; sum: number; currency: string | null };
  items!: AgentEarningItemDTO[];

  static from(from: Date, to: Date, items: AgentEarning[], sum: number): AgentEarningsResponseDTO {
    const dto = new AgentEarningsResponseDTO();
    dto.range = { from: from.toISOString(), to: to.toISOString() };
    dto.totals = {
      count: items.length,
      sum,
      currency: items[0]?.currency ?? null,
    };
    dto.items = items.map(AgentEarningItemDTO.from);
    return dto;
  }
}
