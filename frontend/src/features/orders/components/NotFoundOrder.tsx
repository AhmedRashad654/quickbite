import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFoundOrder = () => {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">Order not found</p>
      <Button variant="outline" size="sm" asChild>
        <Link to="/orders">Back to orders</Link>
      </Button>
    </div>
  );
};

export default NotFoundOrder;
