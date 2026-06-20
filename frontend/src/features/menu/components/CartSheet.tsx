import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
};

const formatPrice = (price: number, currency: string) => {
  const formatted = (price / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
};

const CartSheet = ({ open, onOpenChange, currency }: CartSheetProps) => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const incrementQuantity = useCartStore((s) => s.incrementQuantity);
  const decrementQuantity = useCartStore((s) => s.decrementQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>
            Cart {items.length > 0 ? `(${items.length})` : ""}
          </SheetTitle>
          {items.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-destructive"
            >
              <Trash2 />
              Clear
            </Button>
          ) : null}
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShoppingBag className="h-8 w-8" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-muted-foreground/30">
                        {item.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price, currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => decrementQuantity(item.productId)}
                    >
                      <Minus />
                    </Button>
                    <span className="flex h-8 w-8 items-center justify-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => incrementQuantity(item.productId)}
                    >
                      <Plus />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeItem(item.productId)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>

              <Button
                className="mt-3 w-full"
                size="lg"
                onClick={handleCheckout}
              >
                <ShoppingBag />
                Proceed to checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
