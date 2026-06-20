import { Link } from "react-router-dom";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerLocation } from "@/store/location-store";
import { useCustomerAddresses } from "@/features/profile/hooks/customer-address-hooks";

type CustomerAdressSelectProps = {
  location: CustomerLocation | null;
  onSelect: (location: CustomerLocation) => void;
};

const CustomerAdressSelect = ({
  location,
  onSelect,
}: CustomerAdressSelectProps) => {
  const { data: addresses, isLoading } = useCustomerAddresses();

  if (isLoading) {
    return <div className="h-9 w-72 animate-pulse rounded-md bg-muted" />;
  }

  if (!addresses || addresses.length === 0) {
    return (
      <Button variant="outline" asChild>
        <Link to="/profile">
          <Plus />
          Add address
        </Link>
      </Button>
    );
  }

  const currentAddress = addresses.find(
    (addr) => addr.id === location?.idCustomerAddress,
  );
  const selectValue = currentAddress ? String(currentAddress.id) : "";
  
  return (
    <Select
      value={selectValue}
      onValueChange={(value) => {
        const address = addresses.find((a) => String(a.id) === value);
        if (!address) return;

        onSelect({
          lat: address.lat,
          lng: address.lng,
          label: address.label,
          idCustomerAddress: address.id,
          countryCode: null,
          source: "manual-zone",
        });
      }}
    >
      <SelectTrigger className="h-9 w-full min-w-0 sm:w-72">
        <SelectValue placeholder="Deliver to address" />
      </SelectTrigger>
      <SelectContent>
        {addresses.map((address) => (
          <SelectItem key={address.id} value={String(address.id)}>
            <MapPin />
            {address.label} — {address.street}, {address.city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomerAdressSelect;
