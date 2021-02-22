import * as Etebase from "etebase";
import FileSaver from "file-saver";
import { getItemsZip } from "./utils";

export function canExport() {
  try {
    const canBlob = !!new Blob;
    return canBlob;
  } catch (e) {
    return false;
  }
}

export async function exportItems(items: Etebase.Item[]) {
  const blob = await getItemsZip(items, "blob");
  FileSaver.saveAs(blob, "etesync-notes-export.zip");
}