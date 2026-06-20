import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type LocationSource = "browser" | "manual-zone";

export type CustomerLocation = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string | null;
  idCustomerAddress?: number | null;
  source: LocationSource;
};

type LocationState = {
  location: CustomerLocation | null;
  permissionStatus:
    | "idle"
    | "requesting"
    | "granted"
    | "denied"
    | "unavailable";
  hasAutoRequested: boolean;
  setLocation: (location: CustomerLocation) => void;
  setPermissionStatus: (status: LocationState["permissionStatus"]) => void;
  clearLocation: () => void;
  setHasAutoRequested: (value: boolean) => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      permissionStatus: "idle",
      hasAutoRequested: false,
      setLocation: (location) => set({ location }),
      setPermissionStatus: (permissionStatus) => set({ permissionStatus }),
      clearLocation: () => set({ location: null }),
      setHasAutoRequested: (value) => set({ hasAutoRequested: value }),
    }),
    {
      name: "quickbite-location",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        location: state.location,
      }),
      merge: (persistedState: unknown, currentState) => {
        const typedPersistedState =
          persistedState as Partial<LocationState> | null;
        if (typedPersistedState?.location?.source === "browser") {
          return {
            ...currentState,
            location: null,
            permissionStatus: "idle",
          };
        }
        return {
          ...currentState,
          ...(typedPersistedState ?? {}),
        };
      },
    },
  ),
);
