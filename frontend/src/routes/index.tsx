import AuthLayout from "@/layouts/AuthLayout";
import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./guards";

const SignUp = lazy(() => import("@/features/auth/pages/SignUp"));
const SignIn = lazy(() => import("@/features/auth/pages/SignIn"));
const ForgotPassword = lazy(
  () => import("@/features/auth/pages/ForgotPassword"),
);
const ResetPassword = lazy(() => import("@/features/auth/pages/ResetPassword"));

const Routes = () => {
  const AuthRoutes = [
    {
      path: "/auth",
      element: <GuestRoute />,
      children: [
        {
          element: <AuthLayout />,
          children: [
            {
              index: true,
              element: <Navigate to="sign-in" replace />,
            },
            {
              path: "sign-in",
              element: <SignIn />,
            },
            {
              path: "sign-up",
              element: <SignUp />,
            },
            {
              path: "forgot-password",
              element: <ForgotPassword />,
            },
            {
              path: "reset-password",
              element: <ResetPassword />,
            },
          ],
        },
      ],
    },
  ];

  const errorRoute = {
    path: "*",
    element: <div>not found</div>,
  };

  const router = createBrowserRouter([
    {
      element: <ProtectedRoute />,
      children: [{ path: "/", element: <div>hello</div> }],
    },
    ...AuthRoutes,
    errorRoute,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
