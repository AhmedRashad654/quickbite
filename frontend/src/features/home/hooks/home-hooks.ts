import { useQuery } from "@tanstack/react-query";
import { getNearbyRestaurants } from "../services/home-api";
import type { NearbyRestaurantsParams } from "../types";
import { useCallback } from "react";
import { toast } from "sonner";
import { useLocationStore } from "@/store/location-store";

export const useCurrentLocation = () => {
  const location = useLocationStore((state) => state.location);
  const permissionStatus = useLocationStore((state) => state.permissionStatus);
  const setLocation = useLocationStore((state) => state.setLocation);
  const clearLocation = useLocationStore((state) => state.clearLocation);
  const hasAutoRequested = useLocationStore((state) => state.hasAutoRequested);
  const setHasAutoRequested = useLocationStore(
    (state) => state.setHasAutoRequested,
  );

  const setPermissionStatus = useLocationStore(
    (state) => state.setPermissionStatus,
  );

  const requestCurrentLocation = useCallback(() => {
    if (permissionStatus === "denied") {
      toast.warning(
        "You have blocked access to this site. To enable it, click on the lock icon 🔒 next to the URL at the top of the browser, go to Location -> Allow, and then refresh the page.",
      );
      return;
    }
    if (!navigator.geolocation) {
      setPermissionStatus("unavailable");
      return;
    }

    setPermissionStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Current location",
          source: "browser",
          idCustomerAddress:null,
          countryCode:null
        });
        setPermissionStatus("granted");
      },
      () => {
        setPermissionStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  }, [permissionStatus, setLocation, setPermissionStatus]);

  return {
    location,
    permissionStatus,
    requestCurrentLocation,
    clearLocation,
    setPermissionStatus,
    setLocation,
    hasAutoRequested,
    setHasAutoRequested,
  };
};

export const useNearbyRestaurants = (
  params: NearbyRestaurantsParams | null,
) => {
  return useQuery({
    queryKey: ["home", "nearby-restaurants", params?.lat, params?.lng],
    queryFn: () => getNearbyRestaurants(params!),
    enabled: Boolean(params),
  });
};
