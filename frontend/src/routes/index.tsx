import AppLayout from "@/layouts/AppLayout";
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
const Home = lazy(() => import("@/features/home/pages/Home"));
const Profile = lazy(() => import("@/features/profile/pages/Profile"));
const MenuPage = lazy(() => import("@/features/menu/pages/MenuPage"));
const Checkout = lazy(() => import("@/features/checkout/pages/Checkout"));

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

  const CustomerRoutes = [
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: "/", element: <Home /> },
            { path: "/profile", element: <Profile /> },
            { path: "/menu/:branchId", element: <MenuPage /> },
            { path: "/checkout", element: <Checkout /> },
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
    ...AuthRoutes,
    ...CustomerRoutes,
    errorRoute,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
