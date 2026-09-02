// Load environment variables with proper priority (system > .env)
import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

const rawBundleId = "space.manus.cleanmile.t20260603";
const bundleId =
  rawBundleId
    .replace(/[-_]/g, ".")
    .replace(/[^a-zA-Z0-9.]/g, "")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .toLowerCase()
    .split(".")
    .map((segment) => {
      return /^[a-zA-Z]/.test(segment) ? segment : "x" + segment;
    })
    .join(".") || "space.manus.app";

const timestamp = bundleId.split(".").pop()?.replace(/^t/, "") ?? "";
const schemeFromBundleId = `manus${timestamp}`;

const env = {
  appName: "클린마일",
  appSlug: "clean-mile",
  logoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663727610435/YAQUq9hf5kCEP56QHLSJa4/clean-mile-icon-4uNjLbe44SHEhBUi5eNBqZ.png",
  scheme: schemeFromBundleId,
  iosBundleId: bundleId,
  androidPackage: "com.cleanmile.app",
};

const config: ExpoConfig = {
  name: env.appName,
  slug: env.appSlug,
  version: "1.0.8",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: env.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: env.iosBundleId,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: "쓰레기를 촬영하여 포인트를 적립하기 위해 카메라가 필요합니다.",
      NSLocationWhenInUseUsageDescription: "주변 쓰레기 핫스팟과 플로깅 경로를 확인하기 위해 위치 정보가 필요합니다.",
      NSLocationAlwaysAndWhenInUseUsageDescription: "플로깅 중 이동 거리를 기록하기 위해 위치 정보가 필요합니다.",
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#2ECC71",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: false,
    predictiveBackGestureEnabled: false,
    package: env.androidPackage,
    permissions: [
      "POST_NOTIFICATIONS",
      "CAMERA",
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
    ],
    config: {
      googleMaps: {
        apiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
          process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY ??
          "AIzaSyCDgsFGE3ohjfegCjNmqyypMkGIKT3pi38",
      },
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-camera",
      {
        cameraPermission: "쓰레기를 촬영하여 포인트를 적립하기 위해 카메라가 필요합니다.",
        recordAudioAndroid: false,
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "주변 쓰레기 핫스팟과 플로깅 경로를 확인하기 위해 위치 정보가 필요합니다.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["arm64-v8a"],
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 34,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: false,
  },
};

export default config;
