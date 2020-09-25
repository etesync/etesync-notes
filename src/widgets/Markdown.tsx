// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Linking } from "react-native";
import { useTheme } from "react-native-paper";
import MarkdownDisplay from "react-native-markdown-display";

const Markdown = React.memo(function _Markdown(props: { content: string }) {
  const theme = useTheme();

  return (
    <MarkdownDisplay
      style={{ link: { color: theme.colors.accent, textDecorationLine: "underline" } }}
      onLinkPress={(url) => {
        Linking.openURL(url);
        return true;
      }}
    >
      {props.content}
    </MarkdownDisplay>
  );
});

export default Markdown;

