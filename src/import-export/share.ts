import * as Etebase from "etebase";

export function canShare() {
  return false;
}

export async function shareItem(item: Etebase.Item) {
  const { name } = item.getMeta();
  throw Error(`Cannot share item "${name}". Sharing is not implemented on this platform`);
}