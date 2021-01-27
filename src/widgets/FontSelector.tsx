// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { fontFamilies, FontFamilyKey } from "../helpers";
import AnchorButton from "./AnchorButton";
import Menu from "./Menu";
import MenuItem from "./MenuItem";

interface PropsType extends ViewProps {
  visible: boolean;
  selected: FontFamilyKey;
  onChange: (item: FontFamilyKey) => void;
  onDismiss: () => void;
  onOpen: () => void;
}

export default function FontSelector(inProps: React.PropsWithChildren<PropsType>) {
  const { visible, selected, onDismiss, onChange, onOpen, ...props } = inProps;
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
        <AnchorButton
          open={visible}
          onPress={onOpen}
        >
          {selected && prettyName[selected]}
        </AnchorButton>
      )}
      {...props}
    >
      {Object.keys(prettyName).map((font, idx) => (
        <MenuItem key={idx} onPress={() => onChange(font as FontFamilyKey)} title={prettyName[font]} titleStyle={{ fontFamily: fontFamilies[font] }} active={font === selected} />
      ))}
    </Menu>
  );
}
