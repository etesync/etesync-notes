// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Linking, Platform, StyleSheet, View, ViewProps } from "react-native";
import { Checkbox, useTheme } from "react-native-paper";
import MarkdownDisplay, { MarkdownIt, renderRules, RenderRules } from "react-native-markdown-display";
import { useSelector } from "react-redux";
import { StoreState } from "../../store";
import TaskList from "./markdown-it-tasklist";
import toggleCheckbox from "./toggle-checkbox";

const getStyles = (theme: ReactNativePaper.Theme, fontSize: number) => {
  const defaults = {
    header: {
      fontWeight: "bold",
      marginTop: 20,
      marginBottom: 10,
    },
    margin: 16,
    monospaceFont: Platform.select({
      ios: "Courier",
      android: "monospace",
      default: "SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace",
    }),
  };

  const extraColors = (theme.dark) ? {
    border: "#555",
    blockBackground: "#333",
    blockText: "#ddd",
    link: "#628EF7",
  } : {
    border: "#ccc",
    blockBackground: "#ddd",
    blockText: "#333",
    link: "#0366d6",
  };

  return StyleSheet.create({
    body: {
      color: theme.colors.text,
      fontSize,
    },
    heading1: {
      ...defaults.header,
      borderBottomColor: extraColors.border,
      borderBottomWidth: 1,
      fontSize: fontSize * 2,
      lineHeight: fontSize * 4,
    },
    heading2: {
      ...defaults.header,
      borderBottomColor: extraColors.border,
      borderBottomWidth: 1,
      fontSize: fontSize * 1.5,
      lineHeight: fontSize * 3,
    },
    heading3: {
      ...defaults.header,
      fontSize: fontSize * 1.25,
      lineHeight: fontSize * 2,
    },
    heading4: {
      ...defaults.header,
      fontSize: fontSize,
    },
    heading5: {
      ...defaults.header,
      fontSize: fontSize * 0.875,
    },
    heading6: {
      ...defaults.header,
      fontSize: fontSize * 0.825,
    },
    hr: {
      backgroundColor: extraColors.border,
      height: 3,
      marginVertical: 20,
    },
    blockquote: {
      backgroundColor: "transparent",
      borderColor: extraColors.border,
      fontStyle: "italic",
      marginBottom: defaults.margin,
      paddingTop: defaults.margin,
      paddingHorizontal: defaults.margin,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: defaults.margin,
    },
    link: {
      color: extraColors.link,
      textDecorationLine: "underline",
    },
    blocklink: {
      borderColor: extraColors.link,
    },
    code_inline: {
      backgroundColor: extraColors.blockBackground,
      borderWidth: 0,
      color: extraColors.blockText,
      fontFamily: defaults.monospaceFont,
      padding: 3,
    },
    code_block: {
      backgroundColor: extraColors.blockBackground,
      borderColor: extraColors.border,
      color: extraColors.blockText,
      fontFamily: defaults.monospaceFont,
      marginBottom: defaults.margin,
      padding: defaults.margin,
    },
    fence: {
      backgroundColor: extraColors.blockBackground,
      borderColor: extraColors.border,
      color: extraColors.blockText,
      fontFamily: defaults.monospaceFont,
      marginBottom: defaults.margin,
      padding: defaults.margin,
    },
    table: {
      borderColor: extraColors.border,
      borderRightWidth: 0,
    },
    thead: {},
    tbody: {},
    th: {
      backgroundColor: extraColors.blockBackground,
      borderColor: extraColors.border,
      borderRightWidth: 1,
      fontWeight: "bold",
      textAlign: "center",
    },
    tr: {
      borderColor: extraColors.border,
    },
    td: {
      borderColor: extraColors.border,
      borderRightWidth: 1,
    },
    tasklistItem: {
      display: "flex",
      flexDirection: "row",
    },
    tasklistTextgroup: {
      fontSize: 16, // Same as in Checkbox.Item
      minHeight: 36, // Same as Checkbox.Android
      paddingVertical: 6, // Same as Checkbox.Android
      display: "flex", // The rest is to center on web
      flex: 1,
      alignItems: "center",
    },
  });
};

const getRules = (content: string, setContent: (value: string) => void): RenderRules => {
  return {
    list_item: (node, children, parent, styles, inheritedStyles) => {
      if (node.attributes.class === "task-list-item") {
        return (
          <View
            key={node.key}
            style={styles.tasklistItem}
          >
            <Checkbox.Android
              status={node.attributes.checked === "true" ? "checked" : "unchecked"}
              onPress={() => toggleCheckbox(content, node.attributes.startline, node.attributes.endline, setContent)}
              accessible={false}
            />
            <View style={styles._VIEW_SAFE_bullet_list_content}>{children}</View>
          </View>
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
        const style = hasTasklistParent ? { textgroup: styles.tasklistTextgroup } : styles;

        return renderRules.textgroup(node, children, parent, style, inheritedStyles);
      } else {
        return null;
      }
    },
  };
};

const markdownItInstance = MarkdownIt().use(TaskList);

interface MarkdownPropsType extends ViewProps {
  content: string;
  setContent: (value: string) => void;
}

const Markdown = React.memo(function _Markdown(props: MarkdownPropsType) {
  const { content, setContent } = props;
  const theme = useTheme();
  const fontSize = useSelector((state: StoreState) => state.settings.fontSize);

  return (
    <MarkdownDisplay
      markdownit={markdownItInstance}
      rules={getRules(content, setContent)}
      style={getStyles(theme, fontSize)}
      mergeStyle
      onLinkPress={(url) => {
        Linking.openURL(url);
        return true;
      }}
    >
      {content}
    </MarkdownDisplay>
  );
});

export default Markdown;

