import { useMutation } from "@tanstack/react-query";
import { useIdempotency } from "@/hooks/useIdempotency";
import { placeOrder } from "../services/checkout-api";
import type { PlaceOrderPayload } from "../types";

export const usePlaceOrder = () => {
  const { idempotencyKey, resetKey } = useIdempotency();

  const mutation = useMutation({
    mutationFn: (payload: PlaceOrderPayload) =>
      placeOrder(payload, idempotencyKey),
    meta: { successMessage: "Order placed successfully!" },
    onSuccess: () => {
      resetKey();
    },
  });

  return { ...mutation, idempotencyKey, resetKey };
};
