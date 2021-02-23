import * as React from "react";
import { DrawerItem as BaseDrawerItem } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import Clickable from "./Clickable";
import { Platform } from "react-native";

type PropsType = Omit<React.ComponentProps<typeof BaseDrawerItem>, "icon"> & {
  disabled?: boolean;
  icon: string;
};

export default function DrawerItem(props: PropsType) {
  const { disabled, focused, icon, onPress, to, ...rest } = props;
  const { colors } = useTheme();

  return <Clickable
    active={focused}
    renderChild={(props) => (
      <BaseDrawerItem
        {...props}
        activeTintColor={(disabled) ? colors.disabled : colors.active}
        activeBackgroundColor={(Platform.OS === "web") ? "transparent" : undefined}
        inactiveTintColor={(disabled) ? colors.disabled : colors.text}
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={icon}
            color={(disabled) ? colors.disabled : ((focused) ? colors.activeIcon : colors.inactiveIcon)}
            size={size}
          />
        )}
        to={(disabled) ? "" : to}
        onPress={(disabled) ? () => null : onPress}
        focused={focused}
        {...rest}
      />
    )}
  />;
}
