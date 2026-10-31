import type { ComponentType } from "react";
import { SplashScreensDemo } from "@/components/demos/splash-screens/splash-screens-demo";

/**
 * Demos available to system case studies, keyed by `SystemProject.demo`.
 * Add one only when it runs on real, approved output — never a mock-up.
 */
export const DEMOS: Record<string, ComponentType> = {
  "splash-screens": SplashScreensDemo,
};
