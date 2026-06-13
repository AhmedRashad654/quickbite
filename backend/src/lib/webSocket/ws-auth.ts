import { verifyAccessToken } from '../../app/auth/utils.js';
import { SystemRole } from '../../app/users/enums.js';
import { JwtPayloadType } from '../types/jwtPayload.js';
import { WsNoTokenError } from './errors.js';

export function authenticateHandshake(handshake: { auth?: { token?: string } }): JwtPayloadType {
  const token = handshake.auth?.token;
  if (!token) throw WsNoTokenError;
  return verifyAccessToken(token);
}

export function permittedChannels(user: JwtPayloadType): Set<string> {
  const allowed = new Set<string>([`customer:${user.userId}`]);
  if (user.role === SystemRole.DELIVERY_AGENT) {
    allowed.add(`agent:${user.userId}`);
  }

  if (user.memberships && user.memberships.length > 0) {
    for (const membership of user.memberships) {
      if (membership.restaurantId) {
        allowed.add(`restaurant:${membership.restaurantId}`);
      }
      for (const branchId of membership.branchIds ?? []) {
        allowed.add(`branch:${branchId}`);
      }
    }
  }

  return allowed;
}
