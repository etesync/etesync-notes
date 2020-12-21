// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Checkbox, TouchableRipple, useTheme } from "react-native-paper";
import MarkdownDisplay, { MarkdownIt, renderRules, RenderRules } from "react-native-markdown-display";
import TaskList from "./markdown-it-tasklist";

const rules: RenderRules = {
  list_item: (node, children, parent, styles, inheritedStyles) => {
    if (node.attributes.class === "task-list-item") {
      return (
        <TouchableRipple key={node.key}>
          <View style={tasklistStyles.listItem}>
            <Checkbox.Android
              status={node.attributes.checked === "true" ? "checked" : "unchecked"}
              accessible={false}
            />
            <View style={styles._VIEW_SAFE_bullet_list_content}>{children}</View>
          </View>
        </TouchableRipple>
      );
    } else if (renderRules.list_item != null) {
      return renderRules.list_item(node, children, parent, styles, inheritedStyles);
    } else {
      return null;
    }
  },
  textgroup: (node, children, parent, styles, inheritedStyles) => {
    if (renderRules.textgroup != null) {
      const hasTasklistParent = parent.findIndex((p) => p.attributes?.class === "task-list-item") !== -1;
      const style = hasTasklistParent ? { textgroup: tasklistStyles.textgroup } : styles;

      return renderRules.textgroup(node, children, parent, style, inheritedStyles);
    } else {
      return null;
    }
  },
};

const tasklistStyles = StyleSheet.create({
  listItem: {
    display: "flex",
    flexDirection: "row",
  },
  textgroup: {
    fontSize: 16, // Same as in Checkbox.Item
    minHeight: 36, // Same as Checkbox.Android
    paddingVertical: 6, // Same as Checkbox.Android
    display: "flex", // The rest is to center on web
    flex: 1,
    alignItems: "center",
  },
});

const markdownItInstance = MarkdownIt().use(TaskList);

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

