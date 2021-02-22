import * as Etebase from "etebase";
import * as IntentLauncher from "expo-intent-launcher";
import RNFS from "react-native-fs";
import { getItemsZip } from "./utils";

export function canExport() {
  return true;
}

export async function exportItems(items: Etebase.Item[]) {
  const content = await getItemsZip(items, "base64");
  const result = await IntentLauncher.startActivityAsync("android.intent.action.CREATE_DOCUMENT", {
    type: "application/zip",
    category: "android.intent.category.OPENABLE",
    extra: { "android.intent.extra.TITLE": "etesync-notes-export.zip" },
  });
  if (result.resultCode === IntentLauncher.ResultCode.Success && result?.data) {
    await RNFS.writeFile(result.data, content, "base64");
  }
}