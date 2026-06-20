import { MapPin } from "lucide-react";
import { INTERNATIONAL_ZONES } from "@/constants";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerLocation } from "@/store/location-store";
import { findLocationZoneValue, getZoneValue } from "../utils/location-utils";

type AreaSelectProps = {
  location: CustomerLocation | null;
  onSelect: (location: CustomerLocation) => void;
};

const AreaSelect = ({ location, onSelect }: AreaSelectProps) => {
  const locationzone = findLocationZoneValue(location);
  return (
    <Select
      value={locationzone || ""}
      onValueChange={(nextValue) => {
        const [countryCode, zoneIndex] = nextValue.split(":");
        const country = INTERNATIONAL_ZONES.find(
          (item) => item.countryCode === countryCode,
        );
        const zone = country?.zones[Number(zoneIndex)];

        if (!country || !zone) return;

        onSelect({
          lat: zone.lat,
          lng: zone.lng,
          label: zone.name,
          idCustomerAddress: null,
          countryCode,
          source: "manual-zone",
        });
      }}
    >
      <SelectTrigger className="h-9 w-full min-w-0 sm:w-72">
        <SelectValue placeholder="Choose your area" />
      </SelectTrigger>
      <SelectContent>
        {INTERNATIONAL_ZONES.map((country) => (
          <SelectGroup key={country.countryCode}>
            <SelectLabel>{country.country}</SelectLabel>
            {country.zones.map((zone, index) => (
              <SelectItem
                key={`${country.countryCode}-${zone.name}`}
                value={getZoneValue(country.countryCode, index)}
              >
                <MapPin />
                {zone.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AreaSelect;
