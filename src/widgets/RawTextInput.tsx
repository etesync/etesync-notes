// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { TextInput } from "react-native";
import { useTheme } from "react-native-paper";

export default function RawTextInput(props_: React.ComponentProps<typeof TextInput>) {
  const theme = useTheme();
  const { style, ...props } = props_;

  return (
    <TextInput
      style={[{ color: theme.colors.text, backgroundColor: theme.colors.surface }, style]}
      {...props}
    />
  );
}
