import { useAuthStore } from "@/store/auth-store";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
} from "../services/auth-api";
import { useEffect } from "react";
import { useIdempotency } from "@/hooks/useIdempotency";
import type { ForgotPasswordPayload } from "../types";

export const useLogin = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    meta: { successMessage: "Welcome back" },
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
    },
  });
};

export const useRegister = () => {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: register,
    meta: { successMessage: "Account created" },
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
    },
  });
};

export const useLogout = () => {
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: logout,
    meta: { successMessage: "Signed out" },
    onSettled: () => {
      clearSession();
    },
  });
};

export const useForgotPassword = () => {
  const { idempotencyKey, resetKey } = useIdempotency();
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      forgotPassword(payload, idempotencyKey),
    onSuccess: () => {
      resetKey();
    },
    meta: { successMessage: "Password reset code sent" },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    meta: { successMessage: "Password updated" },
  });
};

export const useMe = (enabled = true) => {
  const setUser = useAuthStore((state) => state.setUser);
  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled,
    meta: { errorMessage: false },
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
};
