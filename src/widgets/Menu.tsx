// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { StatusBar, Platform } from "react-native";
import { Menu as PaperMenu } from "react-native-paper";

export default class Menu extends React.PureComponent<React.ComponentProps<typeof PaperMenu>> {
  public static Item = PaperMenu.Item;

  public render() {
    const { children, ...props } = this.props;

    return (
      <PaperMenu
        statusBarHeight={(Platform.OS === "ios") ? undefined : StatusBar.currentHeight}
        {...props}
      >
        {children}
      </PaperMenu>
    );
  }
}
