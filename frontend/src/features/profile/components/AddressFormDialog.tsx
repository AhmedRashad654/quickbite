import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addressFormSchema, type AddressFormValues } from "../schemas";
import {
  useCreateAddress,
  useUpdateAddress,
} from "../hooks/customer-address-hooks";
import { ADDRESS_TYPE, type CustomerAddress } from "../types";
import { COUNTRY } from "@/types";

type AddressFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  address?: CustomerAddress;
};

const DEFAULT_VALUES: AddressFormValues = {
  label: "",
  country: "EG",
  city: "",
  street: "",
  building: "",
  apartment_number: "",
  type: ADDRESS_TYPE.HOME,
  lat: 0,
  lng: 0,
  is_default: false,
};

export const AddressFormDialog = ({
  open,
  onOpenChange,
  mode,
  address,
}: AddressFormDialogProps) => {
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const isEdit = mode === "edit";

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema) as Resolver<AddressFormValues>,
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        isEdit && address
          ? {
              label: address.label ?? "",
              country: address.country ?? "EG",
              city: address.city ?? "",
              street: address.street ?? "",
              building: address.building ?? "",
              apartment_number: address.apartment_number ?? "",
              type: address.type ?? ADDRESS_TYPE.HOME,
              lat: address.lat ?? 0,
              lng: address.lng ?? 0,
              is_default: address.is_default ?? false,
            }
          : DEFAULT_VALUES,
      );
    }
  }, [open, isEdit, address, form]);

  const onSubmit = (values: AddressFormValues) => {
    if (isEdit && address) {
      updateMutation.mutate(
        { ...values, addressId: address.id },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit address" : "Add address"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="label"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="addr-label">Label</FieldLabel>
                  <Input
                    {...field}
                    id="addr-label"
                    placeholder="e.g. Home, Work"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="country"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-country">Country</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="addr-country"
                        className="w-full"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={COUNTRY.EG}>Egypt</SelectItem>
                        <SelectItem value={COUNTRY.SA}>
                          Saudi Arabia
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-city">City</FieldLabel>
                    <Input
                      {...field}
                      id="addr-city"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="street"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="addr-street">Street</FieldLabel>
                  <Input
                    {...field}
                    id="addr-street"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="building"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-building">Building</FieldLabel>
                    <Input
                      {...field}
                      id="addr-building"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="apartment_number"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-apartment">Apartment</FieldLabel>
                    <Input
                      {...field}
                      id="addr-apartment"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-type">Type</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="addr-type"
                        className="w-full"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ADDRESS_TYPE.HOME}>Home</SelectItem>
                        <SelectItem value={ADDRESS_TYPE.OFFICE}>
                          Office
                        </SelectItem>
                        <SelectItem value={ADDRESS_TYPE.PUBLIC_PLACE}>
                          Public Place
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="is_default"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-default">
                      Set as default
                    </FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={(val) => field.onChange(val === "true")}
                      value={String(field.value ?? false)}
                    >
                      <SelectTrigger
                        id="addr-default"
                        className="w-full"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="lat"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-lat">Latitude</FieldLabel>
                    <Input
                      id="addr-lat"
                      type="number"
                      step="any"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="lng"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="addr-lng">Longitude</FieldLabel>
                    <Input
                      id="addr-lng"
                      type="number"
                      step="any"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      onBlur={field.onBlur}
                      ref={field.ref}
                      name={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Button className="mt-4 w-full" type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : isEdit ? (
                <Save />
              ) : (
                <Plus />
              )}
              {isEdit ? "Save changes" : "Add address"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};
