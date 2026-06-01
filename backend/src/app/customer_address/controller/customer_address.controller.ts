import { Request, Response } from 'express';
import {
  customerAddressService,
  CustomerAddressService,
} from '../service/customer_address.service.js';
import { validateBody } from '../../../lib/validation/validate.js';
import { CreateAddressDTO, UpdateAddressDTO } from '../dto/customer_address.dto.js';

export class CustomerAddressController {
  constructor(private readonly customerAddressService: CustomerAddressService) {}

  getAll = async (req: Request, res: Response) => {
    const addresses = await this.customerAddressService.getByUserId(req.user?.userId!);
    res.status(200).json({ data: addresses });
  };

  create = async (req: Request, res: Response) => {
    const data = await validateBody(CreateAddressDTO, req.body);
    const address = await this.customerAddressService.create(req.user?.userId!, data);
    res.status(201).json({ message: 'Address added', address });
  };

  update = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);
    const data = await validateBody(UpdateAddressDTO, req.body);
    const address = await this.customerAddressService.update(req.user?.userId!, addressId, data);
    res.status(200).json({ message: 'Address updated', address });
  };

  remove = async (req: Request, res: Response) => {
    const addressId = Number(req.params.addressId);
    await this.customerAddressService.remove(req.user?.userId!, addressId);
    res.status(200).json({ message: 'Address deleted' });
  };
}

export const customerAddressController = new CustomerAddressController(customerAddressService);
