import { Link } from "react-router-dom";
import type { OrderSummary } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Package } from "lucide-react";
import { STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import { formatDate } from "@/lib/format-date";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format-price";

function OrderCard({ order }: { order: OrderSummary }) {
  function shortId(publicId: string) {
    return `#${publicId.slice(-8).toUpperCase()}`;
  }

  return (
    <Link to={`/orders/${order.public_id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-5 text-primary" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {shortId(order.public_id)}
              </span>
              <Badge variant={STATUS_VARIANTS[order.status] as never}>
                {STATUS_LABELS[order.status] || order.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatDate(order.created_at)}</span>
              <span>
                {order.items_count} item{order.items_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tabular-nums">
              {formatPrice(order.total, order.currency)}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
export default OrderCard;
