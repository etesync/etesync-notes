// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Checkbox as PaperCheckbox, Paragraph, TouchableRipple } from "react-native-paper";
import { View, StyleProp, ViewStyle } from "react-native";

interface PropsType {
  style?: StyleProp<ViewStyle>;
  title: string;
  status: boolean;
  onPress: () => void;
}

export default function Checkbox(props: PropsType) {
  return (
    <TouchableRipple
      onPress={props.onPress}
      style={props.style}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingHorizontal: 16 }}>
        <Paragraph>{props.title}</Paragraph>
        <View pointerEvents="none">
          <PaperCheckbox.Android
            status={props.status ? "checked" : "unchecked"}
          />
        </View>
      </View>
    </TouchableRipple>
  );
}
