import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { registerSchema, type RegisterFormValues } from "../schemas";
import { SYSTEM_ROLES, type RegisterPayload } from "../types";
import { useRegister } from "../hooks/auth-hooks";
import { COUNTRY } from "@/types";

const SignUp = () => {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: SYSTEM_ROLES.CUSTOMER,
      restaurantName: "",
      restaurantCountry: COUNTRY.EG,
      restaurantLogoUrl: "",
    },
  });
  const selectedRole = useWatch({ control: form.control, name: "role" });
  const isRestaurantUser = selectedRole === SYSTEM_ROLES.RESTAURANT_USER;

  const onSubmit = (values: RegisterFormValues) => {
    const payload: RegisterPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      role: values.role,
    };

    if (values.role === SYSTEM_ROLES.RESTAURANT_USER) {
      payload.restaurant = {
        name: values.restaurantName?.trim() ?? "",
        primary_country: values.restaurantCountry?.trim() ?? "",
      };

      if (values.restaurantLogoUrl?.trim()) {
        payload.restaurant.logo_url = values.restaurantLogoUrl.trim();
      }
    }

    registerMutation.mutate(payload, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-130">
      <div className="mb-6 lg:hidden">
        <p className="text-xl font-semibold">QuickBite</p>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-normal">
          Create account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the account type that matches your role.
        </p>
      </div>

      <form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-name"
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
                  <FieldLabel htmlFor="sign-up-phone">Phone</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-phone"
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

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="sign-up-email"
                  type="email"
                  autoComplete="email"
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
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                  <Input
                    {...field}
                    id="sign-up-password"
                    type="password"
                    autoComplete="new-password"
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
              name="role"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="sign-up-role">Role</FieldLabel>
                  <Select
                    name={field.name}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger
                      id="sign-up-role"
                      className="w-full"
                      onBlur={field.onBlur}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SYSTEM_ROLES.CUSTOMER}>
                        Customer
                      </SelectItem>
                      <SelectItem value={SYSTEM_ROLES.DELIVERY_AGENT}>
                        Delivery agent
                      </SelectItem>
                      <SelectItem value={SYSTEM_ROLES.RESTAURANT_USER}>
                        Restaurant user
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </div>

          {isRestaurantUser ? (
            <div className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="restaurantName"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="sign-up-restaurant-name">
                      Restaurant name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="sign-up-restaurant-name"
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
                name="restaurantCountry"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="primary-counrty">Primary Country</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger
                        id="primary-counrty"
                        className="w-full"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={COUNTRY.EG}>EG</SelectItem>
                        <SelectItem value={COUNTRY.SA}>SA</SelectItem>
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
                name="restaurantLogoUrl"
                render={({ field, fieldState }) => (
                  <Field
                    className="sm:col-span-2"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="sign-up-restaurant-logo">
                      Logo URL
                    </FieldLabel>
                    <Input
                      {...field}
                      id="sign-up-restaurant-logo"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>
          ) : null}

          <Button
            className="mt-2 w-full"
            size="lg"
            type="submit"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus />
            )}
            Create account
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          to="/auth/sign-in"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
