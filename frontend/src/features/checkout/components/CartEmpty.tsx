import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const CartEmpty = () => {
  return (
    <div className="h-[80vh] flex items-center">
      <div className="mx-auto  max-w-2xl px-4 py-4 text-center">
        <ShoppingBag className="mx-auto h-10 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Your cart is empty.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/">Browse restaurants</Link>
        </Button>
      </div>
    </div>
  );
};

export default CartEmpty;
