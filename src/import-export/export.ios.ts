import * as Etebase from "etebase";
import { Share } from "react-native";
import RNFS from "react-native-fs";
import { getItemsZip } from "./utils";

export function canExport() {
  return true;
}

export async function exportItems(items: Etebase.Item[]) {
  const content = await getItemsZip(items, "base64");
  const path = `${RNFS.CachesDirectoryPath}/etesync-notes-export.zip`;

  await RNFS.writeFile(path, content, "base64");

  await Share.share({ url: path });

  await RNFS.unlink(path);
}