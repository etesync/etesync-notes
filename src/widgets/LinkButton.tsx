// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { Text, TouchableRipple, useTheme } from "react-native-paper";

type PropsType = {
  onPress: () => void;
} & ViewProps;

export default function LinkButton(props_: React.PropsWithChildren<PropsType>) {
  const { onPress, children, ...props } = props_;
  const theme = useTheme();

  return (
    <TouchableRipple
      accessibilityRole="link"
      {...props}
      onPress={onPress}
    >
      <Text style={{ color: theme.colors.accent }}>{children}</Text>
    </TouchableRipple>
  );
}
