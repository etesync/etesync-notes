// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";

import TextInput from "./TextInput";

type IconButtonProps = React.ComponentProps<typeof IconButton>;

interface PropsType extends React.ComponentPropsWithoutRef<typeof TextInput> {
  icon: IconButtonProps["icon"];
  iconAccessibilityLabel?: IconButtonProps["accessibilityLabel"];
  iconOnPress?: IconButtonProps["onPress"];
}

const TextInputWithIcon = React.memo(React.forwardRef(function _TexInputWithIcon(inProps: PropsType, ref) {
  const {
    style,
    disabled = false,
    icon,
    iconAccessibilityLabel,
    iconOnPress,
    ...props
  } = inProps;

  return (
    <View style={style}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        ref={ref as any}
        disabled={disabled}
        {...props}
      />
      {!disabled ? (
        <IconButton
          style={{ position: "absolute", top: 15, right: 5 }}
          icon={icon}
          accessibilityLabel={iconAccessibilityLabel}
          onPress={iconOnPress}
        />
      ) : null}
    </View>
  );
}));

export default TextInputWithIcon;
