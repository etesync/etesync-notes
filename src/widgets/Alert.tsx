// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { Text } from "react-native-paper";

type PropsType = ViewProps & {
  severity: "error" | "warning" | "info" | "success";
};

export default function Alert(props_: React.PropsWithChildren<PropsType>) {
  const { children, style, ...props } = props_;

  return (
    <Text
      style={style}
      {...props}
    >
      * {children}
    </Text>
  );
}
