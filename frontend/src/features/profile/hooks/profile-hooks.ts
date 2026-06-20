import { useAuthStore } from "@/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "../services/profile-api";
import type { UpdateProfilePayload } from "../types";

export const useUpdateProfile = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: ({ data }) => {
      setUser(data);
    },
  });
};
