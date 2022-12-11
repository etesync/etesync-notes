
import * as Etebase from "etebase";
import { Share } from "react-native";
import { getItemData } from "./utils";

export function canShare() {
  return true;
}

export async function shareItem(item: Etebase.Item) {
  const { name, content } = await getItemData(item);

  await Share.share({
    message: content,
    title: name,
  });
}