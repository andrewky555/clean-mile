import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

const MAPPING = {
  "house.fill": "home",
  "map.fill": "map",
  "camera.fill": "camera-alt",
  "trophy.fill": "emoji-events",
  "person.fill": "person",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "star.fill": "star",
  "leaf.fill": "eco",
  "location.fill": "location-on",
  "trash.fill": "delete",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "bell.fill": "notifications",
  gear: "settings",
  "arrow.up.circle.fill": "arrow-circle-up",
  "gift.fill": "card-giftcard",
  "flame.fill": "local-fire-department",
  "chart.bar.fill": "bar-chart",
} as const satisfies Record<string, ComponentProps<typeof MaterialIcons>["name"]>;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: string;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
