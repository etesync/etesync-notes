// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { ViewProps, Linking } from "react-native";
import { Text } from "react-native-paper";

import LinkButton from "./LinkButton";
import { useTheme } from "../theme";

type PropsType = {
  href: string;
} & ViewProps;

export default function ExternalLink(props_: React.PropsWithChildren<PropsType>) {
  const { href, children, ...props } = props_;
  const theme = useTheme();

  return (
    <LinkButton
      {...props}
      onPress={() => Linking.openURL(href)}
    >
      <Text style={{ color: theme.colors.accentText }}>{children}</Text>
    </LinkButton>
  );
}
