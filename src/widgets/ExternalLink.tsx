// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps, Linking } from "react-native";
import { Button } from "react-native-paper";

type PropsType = {
  href: string;
} & ViewProps;

class ExternalLink extends React.PureComponent<PropsType> {
  public render() {
    const { href, children, ...props } = this.props;
    return (
      <Button
        accessibilityRole="link"
        {...props}
        onPress={() => Linking.openURL(href)}
      >
        {children}
      </Button>
    );
  }
}

export default ExternalLink;
