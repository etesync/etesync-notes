// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Checkbox, Text, TouchableRipple, useTheme } from "react-native-paper";
import MarkdownDisplay, { MarkdownIt, renderRules, RenderRules } from "react-native-markdown-display";
import TaskCheckbox from "markdown-it-task-checkbox";

const rules: RenderRules = {
  label: (node, _children, _parent, _styles) => 
    <Text
      key={node.key}
      style={defaultStyles.label}
    >
      {node.children[0].content}
    </Text>
  ,
  checkbox_input: (node, _children, _parent, _styles) => 
    <Checkbox.Android
      key={node.key}
      status={node.attributes.checked === "true" ? "checked" : "unchecked"}
      disabled
    />,
  list_item: (node, children, parent, styles, inheritedStyles) => {
    if (node.attributes.class === "task-list-item") {
      return (
        <TouchableRipple key={node.key}>
          <View style={defaultStyles.container} pointerEvents="none">
            {children}
          </View>
        </TouchableRipple>
      );
    } else if (renderRules.list_item != null) {
      return renderRules.list_item(node, children, parent, styles, inheritedStyles);
    } else {
      return null;
    }
  },
  textgroup: (node, children, parent, styles) => {
    const list = parent.find((p) => p.type === "bullet_list");
    if (list != null && list.attributes.class === "task-list") {
      return (
        <React.Fragment key={node.key}>
          {children}
        </React.Fragment>
      );
    } else if (renderRules.textgroup != null) {
      return renderRules.textgroup(node, children, parent, styles);
    } else {
      return null;
    }
  },
};

const defaultStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 16,
  },
});

const markdownItInstance = MarkdownIt().use(TaskCheckbox);

const Markdown = React.memo(function _Markdown(props: { content: string }) {
  const theme = useTheme();

  const blockBackgroundColor = (theme.dark) ? "#555555" : "#cccccc";

  return (
    <MarkdownDisplay
      markdownit={markdownItInstance}
      rules={rules}
      style={{
        body: { color: theme.colors.text },
        link: { color: theme.colors.accent, textDecorationLine: "underline" },
        hr: { backgroundColor: theme.colors.placeholder },
        blockquote: { backgroundColor: blockBackgroundColor },
        code_inline: { backgroundColor: blockBackgroundColor, padding: 0 },
        code_block: { backgroundColor: blockBackgroundColor },
        fence: { backgroundColor: blockBackgroundColor },
      }}
      mergeStyle
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

