import { inject, injectable } from 'tsyringe';
import { OrderService } from '../service/order.service.js';
import { TOKENS } from '../../../lib/di/tokens.js';
import { Request, Response } from 'express';
import { validateBody } from '../../../lib/validation/validate.js';
import { CreateOrderDTO } from '../dto/order.dto.js';
import { sendSuccess } from '../../../lib/http/response.js';

@injectable()
export class OrderController {
  constructor(@inject(TOKENS.OrderService) private readonly orderService: OrderService) {}
  
  placeOrder = async (req: Request, res: Response) => {
    const data = await validateBody(CreateOrderDTO, req.body);
    const result = await this.orderService.placeOrder(req.user!, data);
    sendSuccess(res, result, 201);
  };
}
