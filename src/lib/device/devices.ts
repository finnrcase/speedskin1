import { Laptop, Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";

export type DeviceType = "chromebook" | "mac" | "ipad" | "iphone";

export interface DeviceInfo {
  id: DeviceType;
  label: string;
  blurb: string;
  Icon: LucideIcon;
  /** Touch devices get an interactive on-screen keyboard. */
  isTouch: boolean;
  /**
   * Whether the lesson should render an on-screen keyboard. Chromebook relies
   * on the physical SpeedSkin keyboard cover instead.
   */
  showsOnScreenKeyboard: boolean;
  /** Relative sizing hint for the on-screen keyboard. */
  keyboardSize: "compact" | "large" | "none";
}

export const DEVICES: Record<DeviceType, DeviceInfo> = {
  chromebook: {
    id: "chromebook",
    label: "Chromebook",
    blurb: "Use your physical keyboard with the SpeedSkin cover. No on-screen keys.",
    Icon: Laptop,
    isTouch: false,
    showsOnScreenKeyboard: false,
    keyboardSize: "none",
  },
  mac: {
    id: "mac",
    label: "Mac",
    blurb: "Use a Mac keyboard with Command-key shortcuts and physical-key practice.",
    Icon: Monitor,
    isTouch: false,
    showsOnScreenKeyboard: false,
    keyboardSize: "none",
  },
  ipad: {
    id: "ipad",
    label: "iPad",
    blurb: "A large blank on-screen keyboard — type from memory.",
    Icon: Tablet,
    isTouch: true,
    showsOnScreenKeyboard: true,
    keyboardSize: "large",
  },
  iphone: {
    id: "iphone",
    label: "iPhone",
    blurb: "A compact blank on-screen keyboard — type from memory.",
    Icon: Smartphone,
    isTouch: true,
    showsOnScreenKeyboard: true,
    keyboardSize: "compact",
  },
};

export const DEVICE_LIST: DeviceInfo[] = Object.values(DEVICES);

export const DEFAULT_DEVICE: DeviceType = "chromebook";
