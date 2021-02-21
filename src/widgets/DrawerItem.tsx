import * as React from "react";
import { DrawerItem as BaseDrawerItem } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme";
import Clickable from "./Clickable";

type PropsType = Omit<React.ComponentProps<typeof BaseDrawerItem>, "icon"> & {
  disabled?: boolean;
  icon: string;
};

export default function DrawerItem(props: PropsType) {
  const { disabled, icon, onPress, to, ...rest } = props;
  const { colors } = useTheme();

  return <Clickable
    renderChild={(props) => (
      <BaseDrawerItem
        {...props}
        inactiveTintColor={(disabled) ? colors.disabled : colors.text}
        icon={({ size }) => (
          <MaterialCommunityIcons
            name={icon}
            color={(disabled) ? colors.disabled : colors.inactiveIcon}
            size={size}
          />
        )}
        to={(disabled) ? "" : to}
        onPress={(disabled) ? () => null : onPress}
        {...rest}
      />
    )}
  />;
}
