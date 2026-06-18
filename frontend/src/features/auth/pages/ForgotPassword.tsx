import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
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
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas";
import { useForgotPassword } from "../hooks/auth-hooks";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        navigate(`/auth/reset-password?email=${encodeURIComponent(values.email)}`);
      },
    });
  };

  return (
    <div className="w-full max-w-105">
      <div className="mb-8 lg:hidden">
        <p className="text-xl font-semibold">QuickBite</p>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-normal">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we will send a 6-digit reset code.
        </p>
      </div>

      <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="forgot-password-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
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
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <MailCheck />
            )}
            Send reset code
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

export default ForgotPassword;

