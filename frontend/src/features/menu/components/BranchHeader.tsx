import { Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BranchMenu } from "../types";

type BranchHeaderProps = {
  branch: BranchMenu;
};

const formatPrice = (price: number, currency: string) => {
  const formatted = (price / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
};

const BranchHeader = ({ branch }: BranchHeaderProps) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = (branch.opens_at ?? "00:00").split(":").map(Number);
  const [closeHour, closeMin] = (branch.closes_at ?? "00:00").split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = branch.accept_orders && currentMinutes >= openMinutes && currentMinutes <= closeMinutes;

  return (
    <div className="rounded-lg border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted">
          {branch.logo_url ? (
            <img
              src={branch.logo_url}
              alt={branch.restaurant_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold">
              {branch.restaurant_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{branch.restaurant_name}</h1>
            <Badge variant={isOpen ? "secondary" : "outline"}>
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {branch.branch_name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {branch.address_text}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">
              <Clock className="size-3" />
              {branch.opens_at?.slice(0, 5)} - {branch.closes_at?.slice(0, 5)}
            </Badge>
            <Badge variant="outline">{formatPrice(0, branch.currency).split(" ").slice(1).join(" ")}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchHeader;
