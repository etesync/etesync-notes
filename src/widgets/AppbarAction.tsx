import * as React from "react";
import { Appbar } from "react-native-paper";
import { useTheme } from "../theme";


export default function AppbarAction(props: React.ComponentProps<typeof Appbar.Action>) {
  const { color, ...rest } = props;
  const theme = useTheme();
  const iconColor = color ?? ((theme.dark) ? theme.colors.text : undefined);

  return (
    <Appbar.Action color={iconColor} {...rest} />
  );
}
