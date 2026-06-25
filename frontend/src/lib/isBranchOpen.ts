export interface BranchTimeProps {
  opens_at: string;
  closes_at: string;
  accept_orders: boolean;
  is_active: boolean;
}

export const checkBranchAvailability = (branch: BranchTimeProps): boolean => {
  if (!branch.is_active || !branch.accept_orders) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = (branch.opens_at ?? "00:00")
    .split(":")
    .map(Number);
  const [closeHour, closeMin] = (branch.closes_at ?? "00:00")
    .split(":")
    .map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  if (closeMinutes < openMinutes) {
    if (currentMinutes <= closeMinutes) {
      return true;
    }
    return currentMinutes >= openMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};
