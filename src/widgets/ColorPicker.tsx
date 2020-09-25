// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View } from "react-native";
import { TouchableRipple, HelperText } from "react-native-paper";

import TextInput from "./TextInput";
import ColorBox from "./ColorBox";

interface PropsType {
  color: string;
  defaultColor: string;
  label?: string;
  placeholder?: string;
  error?: string;
  onChange: (color: string) => void;
}

export default function ColorPicker(props: PropsType) {
  const colors = [
    [
      "#F44336",
      "#E91E63",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
    ],
    [
      "#03A9F4",
      "#4CAF50",
      "#8BC34A",
      "#FFEB3B",
      "#FF9800",
    ],
  ];
  const color = props.color;

  return (
    <View>
      {colors.map((colorGroup, idx) => (
        <View key={idx} style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
          {colorGroup.map((colorOption) => (
            <TouchableRipple
              style={{ margin: 5 }}
              key={colorOption}
              onPress={() => props.onChange(colorOption)}
            >
              <ColorBox size={36} style={{ borderRadius: 36 / 2 }} color={colorOption} />
            </TouchableRipple>
          ))}
        </View>
      ))}
      <View style={{ flex: 1, alignItems: "center", flexDirection: "row", margin: 5 }}>
        <ColorBox size={36} color={color ?? props.defaultColor} />
        <TextInput
          style={{ marginLeft: 10, flex: 1 }}
          error={!!props.error}
          onChangeText={props.onChange}
          placeholder={props.placeholder ?? "E.g. #aabbcc"}
          label={props.label ?? "Color"}
          value={color}
        />
        <HelperText
          type="error"
          visible={!!props.error}
        >
          {props.error}
        </HelperText>
      </View>
    </View>
  );
}
