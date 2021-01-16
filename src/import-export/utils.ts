import * as Etebase from "etebase";

export async function getItemData(item: Etebase.Item) {
  const { name } = item.getMeta();
  const content = await item.getContent(Etebase.OutputFormat.String);
  return {
    name,
    content,
  };
}
