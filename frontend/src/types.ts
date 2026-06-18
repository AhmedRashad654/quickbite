export const CURRENCY = {
  EGP: "EGP",
  SAR: "SAR",
} as const;

export const COUNTRY = {
  EG: "EG",
  SA: "SA",
} as const;


export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
export type Country = (typeof COUNTRY)[keyof typeof COUNTRY];