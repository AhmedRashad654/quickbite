import { INTERNATIONAL_ZONES } from "@/constants";
import type { CustomerLocation } from "@/store/location-store";

export const getZoneValue = (countryCode: string, zoneIndex: number) => {
  return `${countryCode}:${zoneIndex}`;
};

export const findLocationZoneValue = (location: CustomerLocation | null) => {
  if (!location?.countryCode || location.source !== "manual-zone")
    return undefined;

  const country = INTERNATIONAL_ZONES.find(
    (item) => item.countryCode === location.countryCode,
  );
  const zoneIndex =
    country?.zones.findIndex((zone) => zone.name === location.label) ?? -1;

  if (zoneIndex < 0) return undefined;

  return getZoneValue(location.countryCode, zoneIndex);
};

