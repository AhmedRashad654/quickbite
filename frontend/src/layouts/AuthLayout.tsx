import heroImage from "@/assets/hero.png";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-muted lg:block">
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <div className="text-xl font-semibold">QuickBite</div>
          <div className="max-w-md">
            <p className="text-3xl font-semibold leading-tight">
              Food operations, orders, and delivery in one place.
            </p>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Sign in to continue managing your account.
            </p>
          </div>
        </div>
      </section>
      <main className="flex min-h-dvh items-center justify-center px-5 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;
