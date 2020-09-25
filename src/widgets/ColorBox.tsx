// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View, StyleProp, ViewStyle } from "react-native";

interface PropsType {
  color: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ColorBox(props: PropsType) {
  const size = (props.size) ? props.size : 64;
  const style = { ...(props.style as any), backgroundColor: props.color, width: size, height: size };

  return (
    <View
      style={style}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Color indicator"
    />
  );
}
