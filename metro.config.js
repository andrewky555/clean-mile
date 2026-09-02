const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const originalResolveRequest = config.resolver.resolveRequest;

// react-native-maps has no web implementation. Stub it on web only so
// iOS/Android bundles can still include the native map.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    (moduleName === "react-native-maps" || moduleName.startsWith("react-native-maps/"))
  ) {
    return { type: "empty" };
  }
  if (
    platform !== "web" &&
    (moduleName === "leaflet" || moduleName.startsWith("leaflet/"))
  ) {
    return { type: "empty" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
