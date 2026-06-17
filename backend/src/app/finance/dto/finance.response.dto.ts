import { Transaction } from "../../payment/types.js";
import { RestaurantBalance } from "../types.js";


export class RestaurantBalanceResponseDTO {
    restaurant_id!: number;
    balances!: Array<{currency: string; balance: number}>;
    asOf!: string;

    static from(restaurantId: number, rows: RestaurantBalance[]): RestaurantBalanceResponseDTO {
        const dto = new RestaurantBalanceResponseDTO();
        dto.restaurant_id = restaurantId;
        dto.balances = rows.map((r) => ({currency: r.currency, balance: r.balance}));
        dto.asOf = new Date().toISOString();
        return dto;
    }
}

export class PayoutResponseDTO {
    id!: number;
    amount!: number;
    currency!: string;
    status!: string;
    provider_reference_id!: string | null;
    createdAt!: string;

    static from(t: Transaction): PayoutResponseDTO {
        const dto = new PayoutResponseDTO();
        dto.id = t.id;
        dto.amount = t.amount;
        dto.currency = t.currency;
        dto.status = t.status;
        dto.provider_reference_id = t.provider_reference_id;
        dto.createdAt = t.created_at.toISOString();
        return dto;
    }
}
