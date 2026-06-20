import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeleteAddress } from "../hooks/customer-address-hooks";
import { ADDRESS_TYPE, type CustomerAddress } from "../types";

type AddressCardProps = {
  address: CustomerAddress;
  onEdit: () => void;
};

const TYPE_LABELS = {
  [ADDRESS_TYPE.HOME]: "Home",
  [ADDRESS_TYPE.OFFICE]: "Office",
  [ADDRESS_TYPE.PUBLIC_PLACE]: "Public Place",
} as const;

export const AddressCard = ({ address, onEdit }: AddressCardProps) => {
  const deleteAddressMutation = useDeleteAddress();

  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{address.label}</span>
            <Badge variant="secondary">{TYPE_LABELS[address.type]}</Badge>
            {address.is_default ? (
              <Badge variant="outline">Default</Badge>
            ) : null}
          </div>
          <CardDescription>
            {address.street}
            {address.building ? `, Bldg ${address.building}` : ""}
            {address.apartment_number
              ? `, Apt ${address.apartment_number}`
              : ""}
            <br />
            {address.city}, {address.country}
          </CardDescription>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={onEdit}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const confirmed = window.confirm(
                "Are you sure want to delete this address ?",
              );
              if (confirmed) {
                deleteAddressMutation.mutate(address.id);
              }
            }}
            disabled={deleteAddressMutation.isPending}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
