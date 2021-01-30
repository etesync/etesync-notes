import * as React from "react";
import { Button } from "react-native-paper";
import { useDeviceBreakpoint } from "../helpers";

type PropsType = Omit<React.ComponentProps<typeof Button>, "mode">;

export default function FormButton(props: PropsType) {
  const { children, style, ...rest } = props;
  const breakpoint = useDeviceBreakpoint("tabletPortrait");
  const alignSelf = (breakpoint) ? "flex-end" : undefined;

  return (
    <Button
      mode="contained"
      style={[{ alignSelf }, style]}
      {...rest}
    >
      {children}
    </Button>
  );
}