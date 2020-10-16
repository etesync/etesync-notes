// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { Text, useTheme, TouchableRipple } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type PropsType = ViewProps & {
  severity: "error" | "warning" | "info" | "success";
  onPress?: () => void;
};

export default function Alert(props_: React.PropsWithChildren<PropsType>) {
  const theme = useTheme();
  const { children, style, severity, onPress, ...props } = props_;
  const icons = {
    error: "information-outline",
    warning: "alert-outline",
    info: "information-outline",
    success: "checkbox-marked-circle-outline",
  };
  const stylesColor = theme.dark ? stylesDark : stylesLight;

  return (
    <View style={[styles.root, stylesColor[severity], style]}>
      <Icon name={icons[severity]} style={[styles.icon, stylesIcon[severity]]} size={24} />
      <TouchableRipple style={styles.touchable} onPress={onPress}>
        <Text
          style={[styles.text, stylesColor[severity]]}
          {...props}
        >
          {children}
        </Text>
      </TouchableRipple>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  icon: {
    marginRight: 12,
  },
  touchable: {
    flex: 1,
  },
  text: {
    flex: 1,
  },
});

const stylesIcon = StyleSheet.create({
  error: {
    color: "#f44336",
  },
  warning: {
    color: "#ff9800",
  },
  info: {
    color: "#2196f3",
  },
  success: {
    color: "#4caf50",
  },
});

const stylesLight = StyleSheet.create({
  error: {
    color: "rgb(97, 26, 21)",
    backgroundColor: "rgb(253, 236, 234)",
  },
  warning: {
    color: "rgb(102, 60, 0)",
    backgroundColor: "rgb(255, 244, 229)",
  },
  info: {
    color: "rgb(13, 60, 97)",
    backgroundColor: "rgb(232, 244, 253)",
  },
  success: {
    color: "rgb(30, 70, 32)",
    backgroundColor: "rgb(237, 247, 237)",
  },
});

const stylesDark = StyleSheet.create({
  error: {
    color: "rgb(250, 179, 174)",
    backgroundColor: "rgb(24, 6, 5)",
  },
  warning: {
    color: "rgb(255, 213, 153)",
    backgroundColor: "rgb(25, 15, 0)",
  },
  info: {
    color: "rgb(166, 213, 250)",
    backgroundColor: "rgb(3, 14, 24)",
  },
  success: {
    color: "rgb(183, 223, 185)",
    backgroundColor: "rgb(7, 17, 7)",
  },
});
