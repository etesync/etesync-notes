// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as Etebase from "etebase";
import * as FileSystem from "expo-file-system";

/*
File structure:
cache_dir/
    user1/ <--- the name of the user
        stoken <-- the stokens of the collection fetch
        cols/
            UID1/ - The uid of the first col
                ...
            UID2/ - The uid of the second col
                col <-- the col itself
                stoken <-- the stoken of the items fetch
                items/
                    item_uid1 <-- the item with uid 1
                    item_uid2
                    ...
 */
export default class LocalCache {
  private initPromise: Promise<void>;
  private username: string;
  private cacheDir = FileSystem.documentDirectory + "etebase_cache/";
  private userDir: string;
  private colsDir: string;

  private constructor(username: string) {
    this.username = username;
    this.userDir = `${this.cacheDir}${this.username}/`;
    this.colsDir = `${this.userDir}cols/`;
    this.initPromise = this.init();
  }

  private async init() {
    await FileSystem.makeDirectoryAsync(this.colsDir, { intermediates: true });
  }

  public static getInstance(username: string) {
    return new LocalCache(username);
  }

  public async clearUserCache() {
    await this.initPromise;
    await FileSystem.deleteAsync(this.userDir);
  }

  private getCollectionItemsDir(colUid: string) {
    return `${this.colsDir}${colUid}/items/`;
  }

  public async saveStoken(stoken: string) {
    await this.initPromise;
    const stokenFile = `${this.userDir}stoken`;
    await FileSystem.writeAsStringAsync(stokenFile, stoken);
  }

  public async loadStoken(): Promise<string | undefined> {
    await this.initPromise;
    const stokenFile = `${this.userDir}stoken`;
    // FIXME: return undefined when we get an exception because the file doesn't exist
    return await FileSystem.readAsStringAsync(stokenFile);
  }

  public async collectionSaveStoken(colUid: string, stoken: string) {
    await this.initPromise;
    const stokenFile = `${this.colsDir}${colUid}/stoken`;
    await FileSystem.writeAsStringAsync(stokenFile, stoken);
  }

  public async collectionLoadStoken(colUid: string): Promise<string | undefined> {
    await this.initPromise;
    const stokenFile = `${this.colsDir}${colUid}/stoken`;
    // FIXME: return undefined when we get an exception because the file doesn't exist
    return await FileSystem.readAsStringAsync(stokenFile);
  }

  public async collectionList(colMgr: Etebase.CollectionManager): Promise<Etebase.Collection[]> {
    await this.initPromise;
    const colDirs = await FileSystem.readDirectoryAsync(this.colsDir);
    const ret: Etebase.Collection[] = [];
    for (const colDir of colDirs) {
      const colFile = colDir + "col";
      const content = await FileSystem.readAsStringAsync(colFile);
      ret.push(colMgr.cacheLoad(Etebase.fromBase64(content)));
    }
    return ret;
  }

  public async collectionGet(colMgr: Etebase.CollectionManager, colUid: string): Promise<Etebase.Collection | undefined> {
    await this.initPromise;
    const colFile = `${this.colsDir}${colUid}/col`;
    // FIXME: return undefined when we get an exception because the file doesn't exist
    const content = await FileSystem.readAsStringAsync(colFile);
    return colMgr.cacheLoad(Etebase.fromBase64(content));
  }

  public async collectionSet(colMgr: Etebase.CollectionManager, collection: Etebase.Collection) {
    await this.initPromise;
    const colDir = `${this.colsDir}${collection.uid}/`;
    await FileSystem.makeDirectoryAsync(colDir);
    const colFile = `${colDir}/col`;
    const content = Etebase.toBase64(colMgr.cacheSave(collection));
    await FileSystem.writeAsStringAsync(colFile, content);
    const itemsDir = this.getCollectionItemsDir(collection.uid);
    await FileSystem.makeDirectoryAsync(itemsDir);
  }

  public async collectionUnset(_colMgr: Etebase.CollectionManager, colUid: string) {
    await this.initPromise;
    const colDir = `${this.colsDir}${colUid}/`;
    await FileSystem.deleteAsync(colDir);
  }

  public async itemList(itemMgr: Etebase.ItemManager, colUid: string): Promise<Etebase.Item[]> {
    await this.initPromise;
    const itemsDir = this.getCollectionItemsDir(colUid);
    const itemList = await FileSystem.readDirectoryAsync(itemsDir);
    const ret: Etebase.Item[] = [];
    for (const itemFile of itemList) {
      const content = await FileSystem.readAsStringAsync(itemFile);
      ret.push(itemMgr.cacheLoad(Etebase.fromBase64(content)));
    }
    return ret;
  }

  public async itemGet(itemMgr: Etebase.ItemManager, colUid: string, itemUid: string): Promise<Etebase.Item | undefined> {
    await this.initPromise;
    const itemsDir = this.getCollectionItemsDir(colUid);
    const itemFile = itemsDir + itemUid;
    // FIXME: return undefined when we get an exception because the file doesn't exist
    const content = await FileSystem.readAsStringAsync(itemFile);
    return itemMgr.cacheLoad(Etebase.fromBase64(content));
  }

  public async itemSet(itemMgr: Etebase.ItemManager, colUid: string, item: Etebase.Item) {
    await this.initPromise;
    const itemsDir = this.getCollectionItemsDir(colUid);
    const itemFile = itemsDir + item.uid;
    const content = Etebase.toBase64(itemMgr.cacheSave(item));
    await FileSystem.writeAsStringAsync(itemFile, content);
  }

  public async itemUnset(_colMgr: Etebase.CollectionManager, colUid: string, itemUid: string) {
    await this.initPromise;
    const itemsDir = this.getCollectionItemsDir(colUid);
    const itemFile = itemsDir + itemUid;
    await FileSystem.deleteAsync(itemFile);
  }
}
