import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  branchId: number | null;
  branchName: string;
  currency: string;
  deliveryFee: number;

  setBranchInfo: (
    branchId: number,
    branchName: string,
    currency: string,
    deliveryFee: number,
  ) => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: number) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      branchId: null,
      branchName: "",
      currency: "",
      deliveryFee: 0,

      setBranchInfo: (branchId, branchName, currency, deliveryFee) =>
        set((state) => {
          if (state.branchId && state.branchId !== branchId) {
            return {
              items: [],
              branchId,
              branchName,
              currency,
              deliveryFee,
            };
          }
          return { branchId, branchName, currency, deliveryFee };
        }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      incrementQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        })),

      decrementQuantity: (productId) =>
        set((state) => {
          const item = state.items.find((i) => i.productId === productId);
          if (!item) return state;
          if (item.quantity <= 1) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i,
            ),
          };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          branchId: null,
          branchName: "",
          currency: "",
          deliveryFee: 0,
        }),
    }),
    {
      name: "quickbite-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
