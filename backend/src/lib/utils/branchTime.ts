import { Country } from "../../app/branch/enums.js";

export interface BranchTimeParams {
  opens_at: string;
  closes_at: string;
  accept_orders: boolean;
  is_active: boolean;
  country_code: Country;
}

export function isBranchOpen(branch: BranchTimeParams): boolean {
  if (!branch.is_active || !branch.accept_orders) {
    return false;
  }

  const timeZone = branch.country_code?.toUpperCase() === Country.SA ? 'Asia/Riyadh' : 'Africa/Cairo';

  const serverNow = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const [currentHour, currentMin] = formatter.format(serverNow).split(':').map(Number);
  const currentMinutes = currentHour * 60 + currentMin;

  const [openHour, openMin] = (branch.opens_at ?? "00:00").split(":").map(Number);
  const [closeHour, closeMin] = (branch.closes_at ?? "00:00").split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  let closeMinutes = closeHour * 60 + closeMin;

  if (closeMinutes < openMinutes) {
    if (currentMinutes <= closeMinutes) {
      return true;
    }
    return currentMinutes >= openMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}