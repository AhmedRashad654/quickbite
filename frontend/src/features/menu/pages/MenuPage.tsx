import { Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useBranchMenu } from "../hooks/useBranchMenu";
import BranchHeader from "../components/BranchHeader";
import CartSheet from "../components/CartSheet";
import CategorySection from "../components/CategorySection";

const MenuPage = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const { data: branch, isLoading } = useBranchMenu(
    branchId ? Number(branchId) : undefined,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const setBranchInfo = useCartStore((s) => s.setBranchInfo);
  const totalItems = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));

  useEffect(() => {
    if (branch) {
      setBranchInfo(
        branch.branch_id,
        branch.branch_name,
        branch.currency,
        branch.delivery_fee,
      );
    }
  }, [branch, setBranchInfo]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading menu
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Branch not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <BranchHeader branch={branch} />

        {branch.menu.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            currency={branch.currency}
          />
        ))}
      </div>

      {totalItems > 0 ? (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
          <Button
            size="lg"
            className="h-12 gap-2 rounded-full px-6 shadow-lg"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag />
            <span>{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
            <Badge
              variant="secondary"
              className="ml-1 text-xs tabular-nums"
            >
              {(branch.currency === "EGP" ? "E£" : branch.currency === "SAR" ? "SR" : "")}
              {(useCartStore.getState().items.reduce(
                (sum, i) => sum + i.price * i.quantity,
                0,
              ) / 100).toFixed(2)}
            </Badge>
          </Button>
        </div>
      ) : null}

      <CartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        currency={branch.currency}
      />
    </div>
  );
};

export default MenuPage;
