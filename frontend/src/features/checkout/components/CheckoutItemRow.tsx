import type { CartItem } from "@/store/cart-store";

type CheckoutItemRowProps = {
  item: CartItem;
  currency: string;
};

const formatPrice = (price: number, currency: string) => {
  const formatted = (price / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
};

const CheckoutItemRow = ({ item, currency }: CheckoutItemRowProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-lg font-semibold text-muted-foreground/30">
            {item.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.price, currency)} × {item.quantity}
        </p>
      </div>

      <p className="text-sm font-medium tabular-nums">
        {formatPrice(item.price * item.quantity, currency)}
      </p>
    </div>
  );
};

export default CheckoutItemRow;
