import { Knex } from 'knex';
import { UpdateUserDTO } from '../dto/users.dto.js';
import { UserNotFoundError } from '../error.js';
import { createUser, findUserById, updateUser } from '../repository/users.repo.js';
import { CreateUserData, User } from '../types.js';
import { hashPassword } from '../../auth/utils.js';

  
export class UserService {

  create = async (data: CreateUserData, trx?: Knex | Knex.Transaction): Promise<User> => {
    const hashedPassword = data.password ? await hashPassword(data.password) : '';
    return createUser(
      {
        email: data.email,
        phone: data.phone,
        name: data.name,
        password_hash: hashedPassword,
        system_role: data.system_role,
      },
      trx,
    );
  };

  getByUserId = async (userId: number) => {
    const user = await findUserById(userId);
    if (!user) {
      throw UserNotFoundError;
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      system_role: user.system_role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  };

  updateProfile = async (userId: number, data: UpdateUserDTO) => {
    const user = await findUserById(userId);
    if (!user) {
      throw UserNotFoundError;
    }
    const updated = await updateUser(userId, data);
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      system_role: updated.system_role,
    };
  };
}

export const userService = new UserService();
