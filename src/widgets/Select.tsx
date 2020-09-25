// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps } from "react-native";
import { Menu } from "react-native-paper";

interface PropsType<T> extends ViewProps {
  visible: boolean;
  anchor: React.ReactNode;
  options: T[];
  noneString?: string;
  titleAccossor?: (item: T) => string;
  onChange: (item: T | null) => void;
  onDismiss: () => void;
}

export default function Select<T = string>(inProps: React.PropsWithChildren<PropsType<T>>) {
  const { visible, anchor, options, onDismiss, noneString, titleAccossor, onChange, ...props } = inProps;

  const getTitle = titleAccossor ?? ((item: T) => item);

  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={anchor}
      {...props}
    >
      {noneString && (
        <Menu.Item onPress={() => onChange(null)} title={noneString} />
      )}
      {options.map((item, idx) => (
        <Menu.Item key={idx} onPress={() => onChange(item)} title={getTitle(item)} />
      ))}
    </Menu>
  );
}
