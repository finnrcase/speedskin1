"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_DEVICE,
  DEVICES,
  type DeviceInfo,
  type DeviceType,
} from "./devices";

const STORAGE_KEY = "speedskin:device";

interface DeviceContextValue {
  device: DeviceType;
  info: DeviceInfo;
  setDevice: (device: DeviceType) => void;
  /** False until the persisted value has been read from localStorage. */
  ready: boolean;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

function isDeviceType(value: string | null): value is DeviceType {
  return (
    value === "chromebook" ||
    value === "mac" ||
    value === "ipad" ||
    value === "iphone"
  );
}

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [device, setDeviceState] = useState<DeviceType>(DEFAULT_DEVICE);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage after mount. setState-in-effect is the intended
  // SSR-safe pattern here: localStorage is unavailable during render/SSR, so we
  // render the default first and reconcile to the stored value on the client.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (isDeviceType(stored)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDeviceState(stored);
      }
    } catch {
      // localStorage may be unavailable (private mode); fall back to default.
    }
    setReady(true);
  }, []);

  const setDevice = useCallback((next: DeviceType) => {
    setDeviceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore write failures; selection still applies for this session.
    }
  }, []);

  const value = useMemo<DeviceContextValue>(
    () => ({ device, info: DEVICES[device], setDevice, ready }),
    [device, setDevice, ready],
  );

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error("useDevice must be used within a DeviceProvider");
  }
  return ctx;
}
