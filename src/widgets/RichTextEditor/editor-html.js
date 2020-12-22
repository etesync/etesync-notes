import getThemedCss from "./editor-css";
import getEditor from "./toastui-editor";

const getEditorHtml = (theme, content) => String.raw`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>${getThemedCss(theme)}</style>
  </head>
  <body>
    <div id="editor"></div>
  <script>
    ${getEditor()}

    const Editor = toastui.Editor
    const editor = new Editor({
      el: document.querySelector('#editor'),
      initialEditType: 'wysiwyg',
      usageStatistics: false,
      height: '100%',
      toolbarItems: [
        'heading',
        'bold',
        'italic',
        'strike',
        'divider',
        'hr',
        'quote',
        'divider',
        'ul',
        'ol',
        'task',
        'divider',
        'link',
        'divider',
        'code',
        'codeblock'
      ],
    })

    ${theme.dark === true ? `
    const cm = document.getElementsByClassName('cm-s-default')[0]
    if (cm != null) {
      cm.classList.remove("cm-s-default");
      cm.classList.add("cm-s-ayu-dark");
    }
    ` : null}

    const rn = window.ReactNativeWebView

    const onMessage = (event) => {
      const { action, data } = JSON.parse(event.data)
      switch (action) {
        case "getcontent": {
          const message = JSON.stringify({
            action: "content",
            data: editor.getMarkdown()
          })
          rn.postMessage(message);
          break
        }
        case "setcontent": {
          editor.setMarkdown(data)
        }
      }
    }
    document.addEventListener("message", onMessage , false);
  </script>
  </body>
</html>`;

export default getEditorHtml;
