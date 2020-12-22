import * as React from "react";
import { useTheme } from "react-native-paper";
import { WebView, WebViewMessageEvent } from "react-native-webview";
// This is a hack because we can't load local files in WebView
import getEditorHtml from "./editor-html";

enum EditorActions {
  SetContent = "setcontent",
  GetContent = "getcontent",
  Content = "content"
}

const sendAction = (webView: React.RefObject<WebView>, action: EditorActions, data?: any) => {
  const message = JSON.stringify({
    action,
    data,
  });
  if (webView.current != null) {
    console.log("Sending message", message);
    webView.current?.postMessage(message);
  }
};

interface PropsType {
  content: string;
  setContent: (value: string) => void;
}

export default function RichTextEditor(props: PropsType) {
  const { content, setContent } = props;
  const theme = useTheme();
  const webView = React.useRef<WebView>(null);
  console.log(content);

  const onEditorMessage = (event: WebViewMessageEvent) => {
    const { action, data }: {action: EditorActions, data: any} = JSON.parse(event.nativeEvent.data);
    switch (action) {
      case EditorActions.Content: {
        console.log("Content", data);
      }
    }
  };

  return (
    <WebView
      ref={webView}
      onMessage={onEditorMessage}
      originWhitelist={["*"]}
      source={{ html: getEditorHtml(theme, content) }}
      onLoad={() => sendAction(webView, EditorActions.SetContent, content)}
    />
  );
}