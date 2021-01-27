import * as React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ViewStyle } from "react-native";
import { Menu } from "react-native-paper";
import { useTheme } from "../theme";

type PropsType = Omit<React.ComponentProps<typeof Menu.Item>, "icon" | "theme" | "style"> & {
  style?: ViewStyle;
  icon?: string;
  active?: boolean;
};

export default function MenuItem(props: PropsType) {
  const { active, disabled, icon, style, ...rest } = props;
  const { colors } = useTheme();
  
  return (
    <Menu.Item
      disabled={disabled}
      icon={(icon) ? ({ color, size }) => <MaterialCommunityIcons name={icon} size={size} color={(active && !disabled) ? colors.activeIcon : color} /> : undefined}
      theme={(active) ? { colors: { text: colors.active } } : undefined}
      style={(active) ? [{ backgroundColor: colors.activeBackground }, style] : style}
      {...rest}
    />
  );
}