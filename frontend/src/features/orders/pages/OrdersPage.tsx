import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/shared/Loading";
import { useCustomerOrders } from "../hooks/useOrders";
import { currentYear, YEAR_OPTIONS } from "../constants";
import OrderCard from "../components/OrderCard";
import NotFoundOrders from "../components/NotFoundOrders";

const OrdersPage = () => {
  const [year, setYear] = useState(currentYear);
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useCustomerOrders(year);

  const orders = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Orders</h1>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-28" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading text="Loading orders" />
      ) : orders.length === 0 ? (
        <NotFoundOrders />
      ) : (
        <div className="flex flex-col gap-5">
          {orders.map((order) => (
            <OrderCard key={order.public_id} order={order} />
          ))}

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
