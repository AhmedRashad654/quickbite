import { Request, Response } from 'express';
import { CustomerAddressService } from '../service/customer_address.service.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { CreateAddressDTO, UpdateAddressDTO } from '../dto/customer_address.dto.js';
import { inject, injectable } from 'tsyringe';
import { TOKENS } from '../../../lib/di/tokens.js';
import { sendSuccess } from '../../../lib/http/response.js';

@injectable()
export class CustomerAddressController {
  constructor(@inject(TOKENS.CustomerAddressService) private readonly customerAddressService: CustomerAddressService) {}

  getAll = async (req: Request, res: Response) => {
    const addresses = await this.customerAddressService.getByUserId(req.user?.userId!);
    sendSuccess(res, addresses);
  };

  create = async (req: Request, res: Response) => {
    const data = await validateBody(CreateAddressDTO, req.body);
    const address = await this.customerAddressService.create(req.user?.userId!, data);
    sendSuccess(res, address, 'Address added successfully', 201);
  };

  update = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);
    const data = await validateBody(UpdateAddressDTO, req.body);
    const address = await this.customerAddressService.update(req.user?.userId!, addressId, data);
    sendSuccess(res, address, 'Address updated');
  };

  remove = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);
    await this.customerAddressService.remove(req.user?.userId!, addressId);
    sendSuccess(res, undefined, 'Address deleted', 200);
  };
}
