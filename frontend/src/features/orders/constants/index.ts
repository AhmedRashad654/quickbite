export const STATUS_VARIANTS: Record<string, string> = {
  pending_payment: "outline",
  placed: "secondary",
  accepted: "default",
  rejected: "destructive",
  preparing: "secondary",
  ready: "default",
  assigned: "outline",
  picked: "default",
  delivered: "default",
  cancelled: "destructive",
};

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Pending Payment",
  placed: "Placed",
  accepted: "Accepted",
  rejected: "Rejected",
  preparing: "Preparing",
  ready: "Ready",
  assigned: "Assigned",
  picked: "Picked Up",
  delivered: "Delivered",
  cancelled: "Cancelled",
};




export const currentYear = new Date().getUTCFullYear();
export const YEAR_OPTIONS = [currentYear, currentYear - 1, currentYear - 2,currentYear - 3];