// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { useTheme } from "../theme";
import Link from "./Link";

type PropsType = {
  to: string;
  external?: boolean;
  onPress?: () => void;
} & ViewProps;

export default function LinkButton(props_: React.PropsWithChildren<PropsType>) {
  const { to, external, onPress, children, ...props } = props_;
  const theme = useTheme();

  return (
    <Link
      to={to}
      external={external}
      onPress={onPress}
      renderChild={(childProps) => (
        <TouchableRipple
          {...childProps}
          {...props}
        >
          <Text style={{ color: theme.colors.accentText }}>{children}</Text>
        </TouchableRipple>
      )}
    />
  );
}
