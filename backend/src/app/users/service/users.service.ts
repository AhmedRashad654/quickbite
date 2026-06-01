import { UpdateUserDTO } from '../dto/users.dto.js';
import { UserNotFoundError } from '../error.js';
import { findUserById, updateUser } from '../repository/users.repo.js';

export class UserService {
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
