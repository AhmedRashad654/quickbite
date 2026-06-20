const SERVICE_FEE_MINOR = 1000;

type OrderSummaryProps = {
  subtotal: number;
  deliveryFee: number;
  currency: string;
};

const formatPrice = (price: number, currency: string) => {
  const formatted = (price / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
};

const OrderSummary = ({ subtotal, deliveryFee, currency }: OrderSummaryProps) => {
  const total = subtotal + deliveryFee + SERVICE_FEE_MINOR;

  return (
    <div className="space-y-2 rounded-lg border bg-card p-4">
      <h3 className="font-medium">Order Summary</h3>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Delivery fee</span>
          <span>{formatPrice(deliveryFee, currency)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Service fee</span>
          <span>{formatPrice(SERVICE_FEE_MINOR, currency)}</span>
        </div>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total, currency)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
