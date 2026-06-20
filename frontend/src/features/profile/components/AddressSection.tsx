import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCustomerAddresses } from "../hooks/customer-address-hooks";
import { AddressCard } from "./AddressCard";
import { AddressFormDialog } from "./AddressFormDialog";
import { useState } from "react";
import type { CustomerAddress } from "../types";

export const AddressSection = () => {
  const { data: address, isLoading } = useCustomerAddresses();
  const [dialogState, setDialogState] = useState<{
    mode: "create" | "edit";
    address?: CustomerAddress;
  } | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">My Addresses</h2>
        <Button size="sm" onClick={() => setDialogState({ mode: "create" })}>
          <Plus />
          Add address
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading addresses...</p>
      ) : address && address.length > 0 ? (
        <div className="space-y-3">
          {address.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => setDialogState({ mode: "edit", address })}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <MapPin className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No addresses added yet.
          </p>
        </div>
      )}

      {dialogState ? (
        <AddressFormDialog
          open={dialogState !== null}
          onOpenChange={(open) => {
            if (!open) setDialogState(null);
          }}
          mode={dialogState.mode}
          address={dialogState.address}
        />
      ) : null}
    </div>
  );
};
