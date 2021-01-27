import * as React from "react";
import { Button } from "react-native-paper";
import { useTheme } from "../theme";

type TypeProps = {
  open: boolean;
  onPress: () => void;
  children: React.ReactNode;
};

export default function AnchorButton(props: TypeProps) {
  const { children, onPress, open } = props; 
  const theme = useTheme();

  return (
    <Button
      mode="contained"
      color={theme.colors.accent}
      labelStyle={{ color: theme.colors.onAccent }}
      onPress={onPress}
      icon={(open) ? "menu-up" : "menu-down"}
      contentStyle={{ flexDirection: "row-reverse" }}
    >
      {children}
    </Button>
  );
}