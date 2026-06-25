import { Bike, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { NearbyBranch } from "../types";

type RestaurantCardProps = {
  branch: NearbyBranch;
  isFallback: boolean;
  onClick?: () => void;
};

const formatDistance = (distance?: number | string) => {
  if (distance === undefined) return null;

  const distanceNumber = Number(distance);
  if (Number.isNaN(distanceNumber)) return null;

  if (distanceNumber < 1000) {
    return `${Math.round(distanceNumber)} m away`;
  }

  return `${(distanceNumber / 1000).toFixed(1)} km away`;
};

const RestaurantCard = ({
  branch,
  isFallback,
  onClick,
}: RestaurantCardProps) => {
  const distance = formatDistance(branch.distance_meters);

  return (
    <Card
      className={`rounded-lg ${onClick ? "cursor-pointer transition-colors hover:bg-accent/50" : ""}`}
      size="sm"
      onClick={onClick}
    >
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3 relative">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {branch.logo_url ? (
              <img
                src={branch.logo_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-base font-semibold">
                {branch.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{branch.name}</CardTitle>
            <CardDescription className="mt-1">{branch.label}</CardDescription>
          </div>
          <Badge
            className="absolute right-0"
            variant={branch?.is_open ? "secondary" : "outline"}
          >
            {branch?.is_open ? "Open" : "Unavailable"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span className="line-clamp-2">{branch.address_text}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            <Bike />
            {branch.currency}
          </Badge>
          {distance ? (
            <Badge variant="outline">
              <Clock />
              {distance}
            </Badge>
          ) : null}
          {isFallback ? (
            <Badge variant="destructive">Outside delivery area</Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
