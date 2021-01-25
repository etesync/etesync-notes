// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { Button } from "react-native-paper";
import { fontFamilies, FontFamilyKey } from "../helpers";
import { useTheme } from "../theme";
import Menu from "./Menu";

interface PropsType extends ViewProps {
  visible: boolean;
  selected: FontFamilyKey;
  onChange: (item: FontFamilyKey) => void;
  onDismiss: () => void;
  onOpen: () => void;
}

export default function FontSelector(inProps: React.PropsWithChildren<PropsType>) {
  const { visible, selected, onDismiss, onChange, onOpen, ...props } = inProps;
  const theme = useTheme();
  const prettyName = {
    regular: "Normal",
    monospace: "Monospace",
    serif: "Serif",
  };

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={(
        <Button
          mode="contained"
          color={theme.colors.accent}
          labelStyle={{ color: theme.colors.onAccent }}
          onPress={onOpen}
        >
          {selected && prettyName[selected]}
        </Button>
      )}
      {...props}
    >
      {Object.keys(prettyName).map((font, idx) => (
        <Menu.Item key={idx} onPress={() => onChange(font as FontFamilyKey)} title={prettyName[font]} titleStyle={{ fontFamily: fontFamilies[font] }} />
      ))}
    </Menu>
  );
}
