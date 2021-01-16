
import * as Etebase from "etebase";
import { Share } from "react-native";
import { getItemData } from "./utils";

export function canShare() {
  return true;
}

export async function shareItem(item: Etebase.Item) {
  const { name, content } = await getItemData(item);
  
  // Adding the name as a title at the beginning of the content because it is not shared otherwise
  const message = `# ${name}\n\n${content}`;
  await Share.share({
    message,
    title: name,
  });
}