// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import { createAction as origCreateAction, ActionMeta } from "redux-actions";

import * as Etebase from "etebase";

import { ConnectionInfo, SettingsType } from "./";

type FunctionAny = (...args: any[]) => any;

function createAction<Func extends FunctionAny, MetaFunc extends FunctionAny>(
  actionType: string,
  payloadCreator: Func,
  metaCreator?: MetaFunc
): (..._params: Parameters<Func>) => ActionMeta<ReturnType<Func>, ReturnType<MetaFunc>> {
  return origCreateAction(actionType, payloadCreator, metaCreator as any) as any;
}

export const login = createAction(
  "LOGIN",
  async (etebase: Etebase.Account) => {
    return etebase.save();
  }
);

export const setCacheCollection = createAction(
  "SET_CACHE_COLLECTION",
  async (_colMgr: Etebase.CollectionManager, col: Etebase.Collection) => {
    return {
      meta: await col.getMeta(),
    };
  },
  (_colMgr: Etebase.CollectionManager, col: Etebase.Collection) => {
    return {
      colUid: col.uid,
    };
  }
);

export const unsetCacheCollection = createAction(
  "UNSET_CACHE_COLLECTION",
  (_colMgr: Etebase.CollectionManager, _colUid: string) => {
    return undefined;
  },
  (_colMgr: Etebase.CollectionManager, colUid: string) => {
    return {
      colUid,
    };
  }
);

export const collectionUpload = createAction(
  "COLLECTION_UPLOAD",
  async (colMgr: Etebase.CollectionManager, col: Etebase.Collection) => {
    await colMgr.upload(col);
    return {
      cache: colMgr.cacheSave(col),
      meta: await col.getMeta(),
    };
  },
  (_colMgr: Etebase.CollectionManager, col: Etebase.Collection) => {
    return {
      colUid: col.uid,
    };
  }
);

export const setCacheItem = createAction(
  "SET_CACHE_ITEM",
  async (_col: Etebase.Collection, _itemMgr: Etebase.ItemManager, item: Etebase.Item) => {
    return {
      meta: await item.getMeta(),
    };
  },
  (col: Etebase.Collection, _itemMgr: Etebase.ItemManager, item: Etebase.Item) => {
    return {
      colUid: col.uid,
      itemUid: item.uid,
    };
  }
);

export const setCacheItemMulti = createAction(
  "SET_CACHE_ITEM_MULTI",
  async (_colUid: string, _itemMgr: Etebase.ItemManager, items: Etebase.Item[]) => {
    const ret = [];
    for (const item of items) {
      ret.push({
        meta: await item.getMeta(),
      });
    }
    return ret;
  },
  (colUid: string, _itemMgr: Etebase.ItemManager, items: Etebase.Item[], _deps?: Etebase.Item[]) => {
    return {
      colUid,
      items: items,
    };
  }
);

export const itemBatch = createAction(
  "ITEM_BATCH",
  async (_col: Etebase.Collection, itemMgr: Etebase.ItemManager, items: Etebase.Item[], deps?: Etebase.Item[]) => {
    await itemMgr.batch(items, deps);
    const ret = [];
    for (const item of items) {
      ret.push({
        meta: await item.getMeta(),
      });
    }
    return ret;
  },
  (col: Etebase.Collection, _itemMgr: Etebase.ItemManager, items: Etebase.Item[], _deps?: Etebase.Item[]) => {
    return {
      colUid: col.uid,
      items: items,
    };
  }
);


export const setSyncCollection = createAction(
  "SET_SYNC_COLLECTION",
  (uid: string, stoken: string) => {
    return {
      uid,
      stoken,
    };
  }
);

export const setSyncGeneral = createAction(
  "SET_SYNC_GENERAL",
  (stoken: string | null) => {
    return stoken;
  }
);

export const logout = createAction(
  "LOGOUT",
  (creds: Etebase.Account) => {
    (async () => {
      const etebase = creds;
      // We don't wait on purpose, because we would like to logout and clear local data anyway
      etebase.logout();
    })();
    return true; // We are not waiting on the above on purpose for now, just invalidate the token in the background
  }
);

export const performSync = createAction(
  "PERFORM_SYNC",
  (syncPromise: Promise<any>) => {
    return syncPromise;
  }
);

export const setConnectionInfo = createAction(
  "SET_CONNECTION_INFO",
  (connectionInfo: ConnectionInfo) => {
    return { ...connectionInfo };
  }
);

export const setSyncStatus = createAction(
  "SET_SYNC_STATUS",
  (status: string | null) => {
    return status;
  }
);

export const addNonFatalError = createAction(
  "ADD_NON_FATAL_ERROR",
  (e: Error) => {
    return e;
  }
);

export const popNonFatalError = createAction(
  "POP_NON_FATAL_ERROR",
  () => {
    return null;
  }
);

export const clearErros = createAction(
  "CLEAR_ERRORS",
  (_etebase: Etebase.Account) => {
    return true;
  }
);

// FIXME: Move the rest to their own file
export const setSettings = createAction(
  "SET_SETTINGS",
  (settings: Partial<SettingsType>) => {
    return { ...settings };
  }
);
