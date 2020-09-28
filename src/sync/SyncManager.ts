// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as Etebase from "etebase";

import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";

import { store, persistor, StoreState, asyncDispatch } from "../store";

import { credentialsSelector } from "../credentials";
import { setSyncCollection, setSyncGeneral, setCacheCollection, unsetCacheCollection, setCacheItemMulti, addNonFatalError, performSync, itemBatch, setSyncStatus } from "../store/actions";
import * as C from "../constants";
import { startTask, arrayToChunkIterator } from "../helpers";

const cachedSyncManager = new Map<string, SyncManager>();
export class SyncManager {
  private COLLECTION_TYPES = [C.colType];
  private BATCH_SIZE = 20;

  public static getManager(etebase: Etebase.Account) {
    const cached = cachedSyncManager.get(etebase.user.username);
    if (cached) {
      return cached;
    }

    const ret = new SyncManager();
    cachedSyncManager.set(etebase.user.username, ret);
    return ret;
  }

  public static removeManager(etebase: Etebase.Account) {
    cachedSyncManager.delete(etebase.user.username);
  }

  protected etebase: Etebase.Account;
  protected isSyncing: boolean;

  private async fetchCollection(col: Etebase.Collection) {
    const storeState = store.getState() as unknown as StoreState;
    const etebase = (await credentialsSelector(storeState))!;
    const syncCollection = storeState.sync.collections.get(col.uid, undefined);

    const colMgr = etebase.getCollectionManager();
    const itemMgr = colMgr.getItemManager(col);

    let stoken = syncCollection?.stoken;
    const limit = this.BATCH_SIZE;
    let done = false;
    while (!done) {
      const items = await itemMgr.list({ stoken, limit });
      store.dispatch(setCacheItemMulti(col.uid, itemMgr, items.data));
      done = items.done;
      stoken = items.stoken;
    }

    if (syncCollection?.stoken !== stoken) {
      store.dispatch(setSyncCollection(col.uid, stoken!));
    }
  }

  private async fetchAllCollections() {
    const storeState = store.getState() as unknown as StoreState;
    const etebase = (await credentialsSelector(storeState))!;
    const syncGeneral = storeState.sync.general;

    const colMgr = etebase.getCollectionManager();
    const limit = this.BATCH_SIZE;
    let stoken = syncGeneral?.stoken;
    let done = false;
    while (!done) {
      const collections = await colMgr.list({ stoken, limit });
      for (const col of collections.data) {
        const meta = await col.getMeta();
        if (this.COLLECTION_TYPES.includes(meta.type)) {
          store.dispatch(setCacheCollection(colMgr, col));
          await this.fetchCollection(col);
        }
      }
      if (collections.removedMemberships) {
        for (const removed of collections.removedMemberships) {
          store.dispatch(unsetCacheCollection(colMgr, removed.uid));
        }
      }
      done = collections.done;
      stoken = collections.stoken;
    }

    if (syncGeneral?.stoken !== stoken) {
      store.dispatch(setSyncGeneral(stoken ?? null));
    }
    return true;
  }

  private async pushAll() {
    const storeState = store.getState() as unknown as StoreState;
    const etebase = (await credentialsSelector(storeState))!;
    const cacheCollections = storeState.cache.collections;
    const cacheItems = storeState.cache.items;
    const syncItemsAll = storeState.sync.items;

    for (const [colUid, syncItems] of syncItemsAll.entries()) {
      for (const chunk of arrayToChunkIterator(Array.from(syncItems.keys()), this.BATCH_SIZE)) {
        const colMgr = etebase.getCollectionManager();
        const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
        const itemMgr = colMgr.getItemManager(col);
        const items = chunk.map((itemUid) => {
          const cacheItem = cacheItems.get(colUid)!.get(itemUid)!;
          const item = itemMgr.cacheLoad(cacheItem.cache);
          return item;
        });

        await asyncDispatch(itemBatch(col, itemMgr, items));
      }
    }

    return true;
  }

  public async sync(alwaysThrowErrors = false) {
    if (this.isSyncing) {
      return false;
    }
    this.isSyncing = true;

    try {
      store.dispatch(setSyncStatus("Pushing changes"));
      await this.pushAll();
      store.dispatch(setSyncStatus("Pulling changes"));
      const stoken = await this.fetchAllCollections();
      return stoken;
    } catch (e) {
      if (alwaysThrowErrors) {
        throw e;
      }

      if (e instanceof Etebase.NetworkError || e instanceof Etebase.TemporaryServerError) {
        // Ignore network errors
        return null;
      } else if (e instanceof Etebase.PermissionDeniedError) {
        store.dispatch(addNonFatalError(e));
        return null;
      } else if (e instanceof Etebase.HttpError) {
        store.dispatch(addNonFatalError(e));
        return null;
      }
      throw e;
    } finally {
      this.isSyncing = false;
    }
  }
}

function persistorLoaded() {
  return new Promise((resolve, _reject) => {
    const subscription = {} as { unsubscribe: () => void };
    subscription.unsubscribe = persistor.subscribe(() => {
      const { bootstrapped } = persistor.getState();
      if (bootstrapped) {
        resolve(true);
        subscription.unsubscribe();
      }
    });
    if (persistor.getState().bootstrapped) {
      resolve(true);
      subscription.unsubscribe();
    }
  });
}

const BACKGROUND_SYNC_TASK_NAME = "SYNCMANAGER_SYNC";

TaskManager.defineTask(BACKGROUND_SYNC_TASK_NAME, async () => {
  const timeout = startTask(() => true, 27 * 1000); // Background fetch is limited to 30 seconds.

  try {
    await persistorLoaded();
    const beforeState = store.getState() as StoreState;
    const etebase = await credentialsSelector(beforeState);

    if (!etebase) {
      return BackgroundFetch.Result.Failed;
    }

    const syncManager = SyncManager.getManager(etebase);
    const sync = syncManager.sync();
    Promise.race([timeout, sync]);
    store.dispatch(performSync(sync));

    const afterState = store.getState();
    const receivedNewData =
      (beforeState.cache.collections !== afterState.cache.collections) ||
      (beforeState.cache.items !== afterState.cache.items);

    return receivedNewData ? BackgroundFetch.Result.NewData : BackgroundFetch.Result.NoData;
  } catch (error) {
    return BackgroundFetch.Result.Failed;
  }
});

export function registerSyncTask(_username: string) {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK_NAME, {
    minimumInterval: 4 * 60 * 60, // 4 hours
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export function unregisterSyncTask(_username: string) {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK_NAME);
}
