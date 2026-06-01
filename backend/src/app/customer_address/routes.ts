import {Router} from "express";
import { authenticate } from "../../lib/auth/guard.js";
import { customerAddressController } from "./controller/customer_address.controller.js";

export const customerAddressRouter = Router();

customerAddressRouter.get('/', authenticate, customerAddressController.getAll);
customerAddressRouter.post('/', authenticate, customerAddressController.create);
customerAddressRouter.patch('/:addressId', authenticate, customerAddressController.update);
customerAddressRouter.delete('/:addressId', authenticate, customerAddressController.remove);