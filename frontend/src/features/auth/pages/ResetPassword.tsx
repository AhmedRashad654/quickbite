import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../schemas";
import { useResetPassword } from "../hooks/auth-hooks";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetPasswordMutation = useResetPassword();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
      otp: "",
      newPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(values, {
      onSuccess: () => {
        navigate("/auth/sign-in", { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-105">
      <div className="mb-8 lg:hidden">
        <p className="text-xl font-semibold">QuickBite</p>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-normal">Set new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the code from your email and choose a new password.
        </p>
      </div>

      <form id="reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-password-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="reset-password-email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="otp"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-password-otp">Reset code</FieldLabel>
                <Input
                  {...field}
                  id="reset-password-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="reset-password-new-password">
                  New password
                </FieldLabel>
                <Input
                  {...field}
                  id="reset-password-new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <Button
            className="mt-2 w-full"
            size="lg"
            type="submit"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <KeyRound />
            )}
            Update password
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          className="inline-flex items-center gap-1 font-medium text-foreground underline-offset-4 hover:underline"
          to="/auth/sign-in"
        >
          <ArrowLeft />
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;
