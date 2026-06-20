import { LocateFixed, MapPin, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomerLocation } from "@/store/location-store";
import AreaSelect from "./AreaSelect";
import CustomerAdressSelect from "./CustomerAdressSelect";

type LocationBarProps = {
  location: CustomerLocation | null;
  permissionStatus:
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "unavailable";
  onUseCurrentLocation: () => void;
  onSelectZone: (location: CustomerLocation) => void;
  onSelectAddress: (location: CustomerLocation) => void;
  onClearLocation: () => void;
};

const LocationBar = ({
  location,
  permissionStatus,
  onUseCurrentLocation,
  onSelectZone,
  onSelectAddress,
  onClearLocation,
}: LocationBarProps) => {
  const isRequesting = permissionStatus === "requesting";
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 xl:flex-row xl:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="size-4 text-muted-foreground" />
          Delivering to
          {location ? (
            <Badge variant="secondary">
              {location.source === "browser"
                ? "Current location"
                : "Selected area"}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 truncate text-sm text-muted-foreground">
          {location?.label ?? "Address not specified"}
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <AreaSelect location={location} onSelect={onSelectZone} />
        <CustomerAdressSelect location={location} onSelect={onSelectAddress} />
        <Button
          type="button"
          variant="outline"
          onClick={onUseCurrentLocation}
          disabled={isRequesting}
        >
          <LocateFixed />
          {isRequesting ? "Locating" : "Use location"}
        </Button>
        {location ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClearLocation}
          >
            <X />
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export default LocationBar;
