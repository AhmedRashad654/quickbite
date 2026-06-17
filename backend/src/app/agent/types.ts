export interface AgentEarning {
  id: number;
  agent_id: number;
  order_id: number;
  amount: number;
  currency: string;
  earned_at: Date;
}

export interface InsertAgentEarningInput {
  agent_id: number;
  order_id: number;
  amount: number;
  currency: string;
}

export interface EarningsRange {
  from: Date;
  to: Date;
}

export interface PresenceMeta {
  lat: number;
  lng: number;
  lastSeenAt: number;
}
