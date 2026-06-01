import { CreateAddressDTO, UpdateAddressDTO } from '../dto/customer_address.dto.js';
import { AddressNotFoundError } from '../errors.js';
import {
  clearDefaultByUserId,
  createAddress,
  deleteAddress,
  findAddressById,
  findAddressesByUserId,
  updateAddress,
} from '../repository/customer-address.repo.js';

export class CustomerAddressService {

  getByUserId = async (userId: number) => {
    const addresses = await findAddressesByUserId(userId);
    return addresses;
  };

  create = async (userId: number, data: CreateAddressDTO) => {
    if (data.is_default) {
      await clearDefaultByUserId(userId);
    }
    const address = await createAddress({ user_id: userId, ...data });
    return address;
  };

  update = async (userId: number, addressId: number, data: Partial<UpdateAddressDTO>) => {
    const existing = await findAddressById(addressId);
    if (!existing || existing.user_id !== userId) {
      throw AddressNotFoundError;
    }
    if (data.is_default) {
      await clearDefaultByUserId(userId);
    }
    const updated = await updateAddress(addressId, data);
    return updated;
  };

  remove = async (userId: number, addressId: number) => {
    const existing = await findAddressById(addressId);
    if (!existing || existing.user_id !== userId) {
      throw AddressNotFoundError;
    }
    await deleteAddress(addressId);
  };
  
}

export const customerAddressService = new CustomerAddressService();
