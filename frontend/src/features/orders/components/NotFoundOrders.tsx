import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { Link } from "react-router-dom";

const NotFoundOrders = () => {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3">
      <Package className="size-12 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">No orders found</p>
      <Button variant="outline" size="sm" asChild>
        <Link to="/">Browse restaurants</Link>
      </Button>
    </div>
  );
};

export default NotFoundOrders;
