import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/shared/Loading";
import { formatPrice } from "@/lib/format-price";
import { useOrderDetail } from "../hooks/useOrders";
import { STATUS_LABELS, STATUS_VARIANTS } from "../constants";
import { formatDate } from "@/lib/format-date";
import NotFoundOrder from "../components/NotFoundOrder";

const OrderDetailPage = () => {
  const { publicId } = useParams<{ publicId: string }>();
  const { data: order, isLoading } = useOrderDetail(publicId);

  if (isLoading) return <Loading text="Loading order" />;

  if (!order) return <NotFoundOrder />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/orders" className="gap-1">
            <ArrowLeft className="size-4" />
            My Orders
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-semibold">
          #{order?.public_id?.slice(-8).toUpperCase()}
        </h1>
        <Badge
          variant={STATUS_VARIANTS[order.status] as never}
          className="text-xs"
        >
          {STATUS_LABELS[order.status] || order.status}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </span>
            </div>
            {order.customer_address.address_text && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="max-w-60 text-right">
                  {order.customer_address.address_text}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.product_id} className="flex items-center gap-3">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="size-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Qty: {item.quantity} ×{" "}
                      {formatPrice(item.unit_price, order.currency)}
                    </span>
                  </div>
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(item.line_total, order.currency)}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatPrice(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="tabular-nums">
                   {`${order.delivery_fee} ${order.currency}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span className="tabular-nums">
                  {`${order.service_fee} ${order.currency}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {order.history.map((entry, index) => {
                const isLast = index === order.history.length - 1;
                return (
                  <div key={entry.status + entry.ts} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {isLast ? (
                        <CheckCircle2 className="size-5 text-primary" />
                      ) : (
                        <Circle className="size-5 text-muted-foreground" />
                      )}
                      {!isLast && (
                        <div className="mt-1 w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium">
                        {STATUS_LABELS[entry.status] || entry.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.ts)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailPage;
