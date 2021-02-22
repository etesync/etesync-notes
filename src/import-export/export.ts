import * as Etebase from "etebase";

export function canExport() {
  return false;
}

export async function exportItems(items: Etebase.Item[]) {
  throw Error(`Cannot export ${items.length} items. Exporting is not implemented on this Platform`);
}