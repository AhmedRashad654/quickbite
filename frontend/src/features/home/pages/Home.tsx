import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import HomeFooter from "../components/HomeFooter";
import HowItWorksSection from "../components/HowItWorksSection";
import LocationBar from "../components/LocationBar";
import NearbyRestaurantsSection from "../components/NearbyRestaurantsSection";
import { useCurrentLocation, useNearbyRestaurants } from "../hooks/home-hooks";

const Home = () => {
  const navigate = useNavigate();
  const {
    location,
    permissionStatus,
    requestCurrentLocation,
    clearLocation,
    setPermissionStatus,
    setLocation,
    hasAutoRequested,
    setHasAutoRequested,
  } = useCurrentLocation();

  const { data: restaurantnearBy, isLoading } = useNearbyRestaurants(
    location ? { lat: location.lat, lng: location.lng } : null,
  );
  useEffect(() => {
    if (
      location?.source !== "manual-zone" &&
      permissionStatus === "idle" &&
      !hasAutoRequested
    ) {
      setHasAutoRequested(true);
      requestCurrentLocation();
    }
  }, [
    hasAutoRequested,
    location,
    permissionStatus,
    requestCurrentLocation,
    setHasAutoRequested,
  ]);

  const branches = restaurantnearBy?.branches ?? [];
  const isFallback = restaurantnearBy?.isFallback ?? false;

  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-lg border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Sparkles />
                  Egypt · Saudi Arabia
                </Badge>
                <span className="text-sm font-medium text-muted-foreground">
                  QuickBite
                </span>
              </div>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Order from restaurants near you
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Choose your area or use your current location to see active
                branches around your delivery address.
              </p>
            </div>
          </div>
        </header>
        <LocationBar
          location={location}
          permissionStatus={permissionStatus}
          onUseCurrentLocation={requestCurrentLocation}
          onSelectZone={(nextLocation) => {
            setLocation(nextLocation);
            setPermissionStatus("granted");
          }}
          onSelectAddress={(nextLocation) => {
            setLocation(nextLocation);
            setPermissionStatus("granted");
          }}
          onClearLocation={() => {
            clearLocation();
            setPermissionStatus("idle");
          }}
        />
        <NearbyRestaurantsSection
          branches={branches}
          isFallback={isFallback}
          isLoading={isLoading}
          location={location}
          onBranchClick={(branchId) => navigate(`/menu/${branchId}`)}
        />

        <HowItWorksSection />
        <HomeFooter />
      </div>
    </main>
  );
};

export default Home;
