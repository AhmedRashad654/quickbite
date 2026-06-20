import { AlertCircle, Loader2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { NearbyBranch } from "../types";
import RestaurantCard from "./RestaurantCard";
import type { CustomerLocation } from "@/store/location-store";

type NearbyRestaurantsSectionProps = {
  branches: NearbyBranch[];
  isFallback: boolean;
  isLoading: boolean;
  location?: CustomerLocation | null;
  onBranchClick?: (branchId: number) => void;
};

const NearbyRestaurantsSection = ({
  branches,
  isFallback,
  isLoading,
  location,
  onBranchClick,
}: NearbyRestaurantsSectionProps) => {
  const hasBranches = branches.length > 0;

  return (
    <section className="rounded-lg border bg-muted/30 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-normal">
              {isFallback ? "Closest restaurants" : "Nearby restaurants"}
            </h2>
            <Badge variant={isFallback ? "destructive" : "secondary"}>
              {isLoading
                ? "Checking"
                : `${branches.length} ${branches.length === 1 ? "branch" : "branches"}`}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            {isFallback
              ? "No restaurants deliver directly here, so these are the closest active branches."
              : location?.source
                ? location?.source === "browser"
                  ? "These active branches are available around your current location."
                  : "These active branches are available around your selected address."
                : ""}
          </p>
          {location?.label ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              Showing results for:{" "}
              <span className="font-medium">{location?.label}</span>
            </p>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed bg-background/70">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Finding nearby restaurants
          </div>
        </div>
      ) : null}

      {!isLoading && !hasBranches ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed bg-background/70 p-6 text-center">
          <div>
            <AlertCircle className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">
              No restaurants to show yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an area or use your current location to refresh results.
            </p>
          </div>
        </div>
      ) : null}

      {!isLoading && hasBranches ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {branches.map((branch) => (
            <RestaurantCard
              key={branch.id}
              branch={branch}
              isFallback={isFallback}
              onClick={onBranchClick ? () => onBranchClick(branch.id) : undefined}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default NearbyRestaurantsSection;
