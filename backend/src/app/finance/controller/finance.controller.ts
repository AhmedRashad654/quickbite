import {Request, Response} from "express";
import {injectable, inject} from "tsyringe";
import { FinanceService } from "../service/finance.service.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { sendSuccess } from "../../../lib/http/response.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { CreatePayoutRequestDTO } from "../dto/finance.request.dto.js";


const PAYOUT_LIST_LIMIT = 50;

@injectable()
export class FinanceController {
    constructor(@inject(TOKENS.FinanceService) private readonly finance: FinanceService) {}

    getBalance = async (req: Request, res: Response) => {
            const restaurantId = Number(req.params.restaurantId);
            const dto = await this.finance.getBalance(restaurantId);
            sendSuccess(res, dto);
    };

    listPayouts = async (req: Request, res: Response) => {
            const restaurantId = Number(req.params.restaurantId);
            const now = new Date();
            const defaultFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const from = req.query.from ? new Date(String(req.query.from)) : defaultFrom;
            const to = req.query.to ? new Date(String(req.query.to)) : now;
            const items = await this.finance.listPayouts(restaurantId, from, to, PAYOUT_LIST_LIMIT);
            sendSuccess(res, items);
    };

    /** POST /admin/restaurants/:restaurantId/payouts */
    createPayout = async (req: Request, res: Response) => {
            const body = await validateBody(CreatePayoutRequestDTO, {
                ...req.body,
                restaurantId: Number(req.params.restaurantId),
            });
            const idempotencyKey = String(req.headers["idempotency-key"] ?? "");
            const dto = await this.finance.recordPayout(body, idempotencyKey);
            sendSuccess(res, dto, 201);
    };
}
