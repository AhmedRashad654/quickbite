import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

const FullPageLoader = () => (
  <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
    Loading
  </div>
);

export const ProtectedRoute = () => {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!isBootstrapped) {
    return <FullPageLoader />;
  }

  if (!accessToken) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!isBootstrapped) {
    return <FullPageLoader />;
  }

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
