import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { profileSchema, type ProfileFormValues } from "../schemas";
import { useUpdateProfile } from "../hooks/profile-hooks";

export const ProfileInfo = () => {
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user, form]);

  const onSubmit = (values: ProfileFormValues) => {
    const payload: Record<string, string> = {};
    if (values.name !== user?.name) payload.name = values.name;
    if (values.phone !== user?.phone) payload.phone = values.phone;

    if (Object.keys(payload).length === 0) return;

    updateProfileMutation.mutate(payload);
  };

  return (
    <div>
      <h2 className="mb-4 text-lg font-medium">Personal Information</h2>
      <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="profile-name"
                    autoComplete="name"
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
              name="phone"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-phone">Phone</FieldLabel>
                  <Input
                    {...field}
                    id="profile-phone"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </div>

          <Button
            className="mt-4"
            type="submit"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save />
            )}
            Save changes
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
};
