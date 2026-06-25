import { inject, injectable } from 'tsyringe';
import { OrderService } from '../service/order.service.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { Request, Response } from 'express';
import { validateBody } from '../../../lib/validation/validate.js';
import { CreateOrderDTO } from '../dto/order.dto.js';
import { sendPaginated, sendSuccess } from '../../../lib/http/response.js';
import { PaymentMethod } from '../enums.js';
import { parsePaginationQuery } from '../../../lib/http/pagination/parse-query.js';

@injectable()
export class OrderController {
  constructor(@inject(TOKENS.OrderService) private readonly orderService: OrderService) {}

  placeOrder = async (req: Request, res: Response) => {
    const data = await validateBody(CreateOrderDTO, req.body);
    const result = await this.orderService.placeOrder(req.user!, data);
    sendSuccess(
      res,
      result,
      result.payment_method === PaymentMethod.ONLINE
        ? 'Your order has been placed and you will be redirected to the payment page.'
        : 'The order has been placed.',
      201,
    );
  };

  getOrder = async (req: Request, res: Response) => {
    const result = await this.orderService.getOrder(String(req.params.publicId), req.user!);
    sendSuccess(res, result);
  };

  listCustomerOrders = async (req: Request, res: Response) => {
    const year = Number(req.query.year) || new Date().getUTCFullYear();
    const pagination = parsePaginationQuery(req.query as Record<string, unknown>, ['created_at']);
    const result = await this.orderService.listCustomerOrders(
      { userId: req.user!.userId, role: req.user!.role },
      year,
      pagination,
    );
    sendPaginated(res, result.data, result.meta);
  };
}
