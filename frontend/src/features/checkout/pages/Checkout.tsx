import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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
import { checkoutSchema, type CheckoutFormValues } from "../schemas";
import CartEmpty from "../components/CartEmpty";
import PaymentRedirect from "../components/PaymentRedirect";

const Checkout = () => {
  const items = useCartStore((s) => s.items);
  const branchId = useCartStore((s) => s.branch_id);
  const branchName = useCartStore((s) => s.branch_name);
  const currency = useCartStore((s) => s.currency);
  const deliveryFee = useCartStore((s) => s.delivery_fee);
  const clearCart = useCartStore((s) => s.clearCart);
  const subTotal = useCartStore((s) => s.getSubTotal());
  const navigate = useNavigate();

  const { data: addresses, isLoading: addressesLoading } =
    useCustomerAddresses();

  const {
    mutate: placeOrder,
    isPending: isPlacing,
    data: result,
  } = usePlaceOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      order_type: "delivery",
      customer_address_id: null,
      payment_method: "cod",
    },
  });

  const orderType = useWatch({
    control: form.control,
    name: "order_type",
  });

  const onSubmit = (values: CheckoutFormValues) => {
    if (!branchId) return;

    placeOrder(
      {
        branch_id: branchId,
        order_type: values.order_type,
        customer_address_id:
          values.order_type === "delivery"
            ? values.customer_address_id!
            : undefined,

        payment_method: values.payment_method,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: ({ data }) => {
          clearCart();
          if (data.payment_method === "online" && data.payment?.redirectUrl) {
            window.location.href = data.payment.redirectUrl;
          }
          if (data.payment_method === "cod") {
            navigate(`/orders/${data.public_id}`);
          }
        },
      },
    );
  };

  if (
    result?.data?.payment_method === "online" &&
    result?.data?.payment?.redirectUrl
  )
    return <PaymentRedirect />;

  if (items.length === 0) {
    return <CartEmpty />;
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
          <h2 className="mb-3 text-lg font-medium">Items from {branchName}</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <CheckoutItemRow
                key={item.product_id}
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
              name="order_type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="checkout-order-type">
                    Order Type
                  </FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger id="checkout-order-type" className="w-full">
                      <SelectValue placeholder="How do you want your order?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delivery">🚴 Delivery</SelectItem>
                      <SelectItem value="pickup">🛍️ Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            {orderType === "delivery" && (
              <Controller
                control={form.control}
                name="customer_address_id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="checkout-address"
                      className="flex justify-between gap-2 items-center"
                    >
                      Delivery address
                      <Link
                        to="/profile"
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        Add new address
                      </Link>
                    </FieldLabel>
                    {addressesLoading ? (
                      <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading addresses
                      </div>
                    ) : !addresses || addresses.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        No addresses saved.{" "}
                      </div>
                    ) : (
                      <>
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
                              <SelectItem key={addr.id} value={String(addr.id)}>
                                {addr.label} — {addr.street}, {addr.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            )}

            <Controller
              control={form.control}
              name="payment_method"
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
                        {orderType === "pickup"
                          ? "Pay at restaurant"
                          : "Cash on delivery"}
                      </SelectItem>
                      <SelectItem value="online">Pay online</SelectItem>
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
              subtotal={subTotal}
              deliveryFee={orderType === "pickup" ? 0 : deliveryFee}
              currency={currency}
            />
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            type="submit"
            disabled={isPlacing}
          >
            {isPlacing ? <Loader2 className="animate-spin" /> : <ShoppingBag />}
            Place order
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
