import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.app",
  appName: "xpect-portal",
  webDir: "dist",
  server: {
    androidScheme: "https",
    hostname: "localhost",
  },
};

export default config;
