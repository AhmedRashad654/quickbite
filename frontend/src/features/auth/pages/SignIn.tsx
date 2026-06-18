import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
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
import { loginSchema, type LoginFormValues } from "../schemas";
import { useLogin } from "../hooks/auth-hooks";

const SignIn = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate("/", { replace: true });
      },
    });
  };

  return (
    <div className="w-full max-w-105">
      <div className="mb-8 lg:hidden">
        <p className="text-xl font-semibold">QuickBite</p>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-normal">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your email and password to continue.
        </p>
      </div>

      <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="sign-in-email"
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
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
                <Input
                  {...field}
                  id="sign-in-password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />

          <div className="-mt-2 flex justify-end">
            <Link
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              to="/auth/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            className="mt-2 w-full"
            size="lg"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
            Sign in
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to QuickBite?{" "}
        <Link className="font-medium text-foreground underline-offset-4 hover:underline" to="/auth/sign-up">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default SignIn;
