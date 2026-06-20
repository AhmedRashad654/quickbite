import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerAddresses } from "@/features/profile/hooks/customer-address-hooks";
import { useCartStore } from "@/store/cart-store";
import CheckoutItemRow from "../components/CheckoutItemRow";
import OrderSummary from "../components/OrderSummary";
import { usePlaceOrder } from "../hooks/useCheckout";

const checkoutSchema = z.object({
  customerAddressId: z.number().min(1, "Select a delivery address"),
  paymentMethod: z.enum(["cod", "online"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const items = useCartStore((s) => s.items);
  const branchId = useCartStore((s) => s.branchId);
  const branchName = useCartStore((s) => s.branchName);
  const currency = useCartStore((s) => s.currency);
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const clearCart = useCartStore((s) => s.clearCart);

  const { data: addresses, isLoading: addressesLoading } =
    useCustomerAddresses();
  const {
    mutate: placeOrder,
    isPending: isPlacing,
    data: orderResult,
    reset: resetMutation,
  } = usePlaceOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerAddressId: 0,
      paymentMethod: "cod",
    },
  });

  if (items.length === 0 && !orderResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Your cart is empty.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/">Browse restaurants</Link>
        </Button>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const onSubmit = (values: CheckoutFormValues) => {
    if (!branchId) return;
    placeOrder(
      {
        branchId,
        customerAddressId: values.customerAddressId,
        paymentMethod: values.paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: (result) => {
          clearCart();
          if (
            result.payment_method === "online" &&
            result.payment?.redirectUrl
          ) {
            window.location.href = result.payment.redirectUrl;
          }
        },
      },
    );
  };

  if (orderResult) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Order Placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your order has been placed successfully.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Order ID:{" "}
          <span className="font-mono font-medium">
            {orderResult.public_id.slice(0, 8)}
          </span>
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => resetMutation()}>
            Place another order
          </Button>
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to={branchId ? `/menu/${branchId}` : "/"}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to menu
      </Link>

      <h1 className="mb-6 text-2xl font-semibold">Checkout</h1>

      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-lg font-medium">
            Items from {branchName}
          </h2>
          <div className="space-y-2">
            {items.map((item) => (
              <CheckoutItemRow
                key={item.productId}
                item={item}
                currency={currency}
              />
            ))}
          </div>
        </section>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Controller
              control={form.control}
              name="customerAddressId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="checkout-address">
                    Delivery address
                  </FieldLabel>
                  {addressesLoading ? (
                    <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading addresses
                    </div>
                  ) : !addresses || addresses.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No addresses saved.{" "}
                      <Link
                        to="/profile"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Add an address
                      </Link>
                    </div>
                  ) : (
                    <Select
                      name={field.name}
                      onValueChange={(val) =>
                        field.onChange(val === "" ? 0 : Number(val))
                      }
                      value={field.value ? String(field.value) : ""}
                    >
                      <SelectTrigger
                        id="checkout-address"
                        className="w-full"
                        onBlur={field.onBlur}
                        ref={field.ref}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((addr) => (
                          <SelectItem
                            key={addr.id}
                            value={String(addr.id)}
                          >
                            {addr.label} — {addr.street}, {addr.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="paymentMethod"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="checkout-payment">
                    Payment method
                  </FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="checkout-payment"
                      className="w-full"
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">
                        Cash on delivery
                      </SelectItem>
                      <SelectItem value="online">
                        Pay online
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="mt-6">
            <OrderSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              currency={currency}
            />
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            type="submit"
            disabled={isPlacing}
          >
            {isPlacing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ShoppingBag />
            )}
            Place order
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
