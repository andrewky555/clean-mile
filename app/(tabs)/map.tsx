import { lazy, Suspense } from "react";
import { ActivityIndicator, View } from "react-native";

const Screen = lazy(() => import("@/components/map-screen"));

export default function MapRoute() {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, backgroundColor: "#F0FFF4", alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#2ECC71" />
        </View>
      }
    >
      <Screen />
    </Suspense>
  );
}
