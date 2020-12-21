// SPDX-FileCopyrightText: © 2016 Revin Guillen
//
// Markdown-it plugin to render GitHub-style task lists; see
//
// https://github.com/blog/1375-task-lists-in-gfm-issues-pulls-comments
// https://github.com/blog/1825-task-lists-in-all-markdown-documents
import MarkdownIt from "markdown-it";
import Token from "markdown-it/lib/token";

function attrSet(token: Token, name: string, value: string) {
  const index = token.attrIndex(name);
  const attr: [string, string] = [name, value];

  if (index < 0) {
    token.attrPush(attr);
  } else if (token.attrs != null) {
    token.attrs[index] = attr;
  }
}

function parentToken(tokens: Token[], index: number) {
  const targetLevel = tokens[index].level - 1;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel) {
      return i;
    }
  }
  return -1;
}

function isInline(token: Token) {
  return token.type === "inline";
}
function isParagraph(token: Token) {
  return token.type === "paragraph_open";
}
function isListItem(token: Token) {
  return token.type === "list_item_open";
}
function startsWithTodoMarkdown(token: Token) {
  // leading whitespace in a list item is already trimmed off by markdown-it
  return (
    token.content.indexOf("[ ] ") === 0 ||
    token.content.indexOf("[x] ") === 0 ||
    token.content.indexOf("[X] ") === 0
  );
}

function isTodoItem(tokens: Token[], index: number) {
  return (
    isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    isListItem(tokens[index - 2]) &&
    startsWithTodoMarkdown(tokens[index])
  );
}

const markdownItTasklist: MarkdownIt.PluginSimple = function (md) {
  md.core.ruler.after("inline", "gfm-tasklists", function (state) {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      if (isTodoItem(tokens, i)) {
        const token = tokens[i];
        const checked = !token.content.startsWith("[ ]");
        if (token.children != null) {
          token.children[0].content = token.children[0].content.slice(3);
        }
        // list_item ancestor
        attrSet(tokens[i - 2], "class", "task-list-item");
        attrSet(tokens[i - 2], "checked", checked ? "true" : "false");
        // bullet_list ancestor
        attrSet(tokens[parentToken(tokens, i - 2)], "class", "task-list");
      }
    }
    return true;
  });
};

export default markdownItTasklist;
