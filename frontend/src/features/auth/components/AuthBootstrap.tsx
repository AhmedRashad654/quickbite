import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/store/auth-store";
import { getMe, refreshToken } from "../services/auth-api";

type AuthBootstrapProps = {
  children: ReactNode;
};

const AuthBootstrap = ({ children }: AuthBootstrapProps) => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const refreshed = await refreshToken();
        if (!isMounted) return;

        setAccessToken(refreshed.data.accessToken);
        const user = await getMe();
        if (!isMounted) return;

        setUser(user.data);
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setBootstrapped(true);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession, setAccessToken, setBootstrapped, setUser]);

  return children;
};

export default AuthBootstrap;
