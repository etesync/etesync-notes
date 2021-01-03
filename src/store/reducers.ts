// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import { Action, ActionMeta, ActionFunctionAny, combineActions, handleAction, handleActions } from "redux-actions";

import { List, Map as ImmutableMap } from "immutable";

import * as Etebase from "etebase";

import * as actions from "./actions";
import { LogLevel } from "../logging";
import { FontFamilyKey } from "../helpers";

interface BaseModel {
  uid: string;
}

export interface SyncCollectionsEntryData extends BaseModel {
  stoken: string;
}

export type SyncCollectionsData = ImmutableMap<string, SyncCollectionsEntryData>;
export type SyncItemsData = ImmutableMap<string, ImmutableMap<string, true>>;

export type CachedItem = { cache: Uint8Array, meta: Etebase.ItemMetadata, isDeleted: boolean };
export type CachedItems = ImmutableMap<string, CachedItem>;
export type CachedItemsData = ImmutableMap<string, CachedItems>;
export type CachedCollection = { cache: Uint8Array, meta: Etebase.ItemMetadata, collectionType: string };
export type CachedCollectionsData = ImmutableMap<string, CachedCollection>;

export type SyncGeneralData = {
  stoken?: string | null;
  lastSyncDate?: Date;
};

export type Message = {
  message: string;
  severity: "error" | "warning" | "info" | "success";
};

export interface CredentialsData {
  storedSession?: string;
}

export const credentials = handleActions(
  {
    [actions.login.toString()]: (
      state: CredentialsData, action: Action<string>) => {
      if (action.error) {
        return state;
      } else if (action.payload === undefined) {
        return state;
      } else {
        return {
          storedSession: action.payload,
        };
      }
    },
    [actions.logout.toString()]: (_state: CredentialsData, _action: any) => {
      return { storedSession: undefined };
    },
  },
  { storedSession: undefined }
);

export const syncCollections = handleActions(
  {
    [actions.setSyncCollection.toString()]: (state: SyncCollectionsData, action: Action<SyncCollectionsEntryData>) => {
      if (action.payload !== undefined) {
        return state.set(action.payload.uid, action.payload);
      }
      return state;
    },
    [actions.logout.toString()]: (state: SyncCollectionsData, _action: any) => {
      return state.clear();
    },
  },
  ImmutableMap({})
);

export const syncItems = handleActions(
  {
    [actions.itemBatch.toString()]: (state: SyncItemsData, action_: Action<unknown>) => {
      const action = action_ as ActionMeta<CachedItem[], { colUid: string, items: Etebase.Item[] }>;
      if (action.payload !== undefined) {
        return state.withMutations((state) => {
          for (const item of action.meta.items) {
            state.removeIn([action.meta.colUid, item.uid]);
          }
        });
      }
      return state;
    },
    [actions.setSyncItem.toString()]: (state: SyncItemsData, action: Action<{ colUid: string, itemUid: string }>) => {
      if (action.payload !== undefined) {
        return state.setIn([action.payload.colUid, action.payload.itemUid], true);
      }
      return state;
    },
    [actions.unsetSyncItem.toString()]: (state: SyncItemsData, action: Action<{ colUid: string, itemUid: string }>) => {
      if (action.payload !== undefined) {
        return state.removeIn([action.payload.colUid, action.payload.itemUid]);
      }
      return state;
    },
    [actions.logout.toString()]: (state: SyncItemsData, _action: any) => {
      return state.clear();
    },
  },
  ImmutableMap({})
);

export const syncGeneral = handleActions(
  {
    [actions.setSyncGeneral.toString()]: (state: SyncGeneralData, action: Action<string | null | undefined>) => {
      if (action.payload !== undefined) {
        return {
          stoken: action.payload,
          lastSyncDate: new Date(),
        };
      }
      return state;
    },
    [actions.logout.toString()]: (_state: SyncGeneralData, _action: any) => {
      return {};
    },
  },
  {} as SyncGeneralData
);

export const collections = handleActions(
  {
    [combineActions(
      actions.setCacheCollection,
      actions.collectionUpload,
      actions.unsetCacheCollection
    ).toString()]: (state: CachedCollectionsData, action: ActionMeta<CachedCollection, { colUid: string, deleted: boolean }>) => {
      if (action.payload !== undefined) {
        if (action.meta.deleted) {
          return state.remove(action.meta.colUid);
        } else {
          return state.set(action.meta.colUid, action.payload);
        }
      }
      return state;
    },
    [actions.logout.toString()]: (state: CachedCollectionsData, _action: any) => {
      return state.clear();
    },
  },
  ImmutableMap({})
);

export const items = handleActions(
  {
    [combineActions(
      actions.setCacheItem
    ).toString()]: (state: CachedItemsData, action: ActionMeta<CachedItem, { colUid: string, itemUid: string }>) => {
      if (action.payload !== undefined) {
        return state.setIn([action.meta.colUid, action.meta.itemUid], action.payload);
      }
      return state;
    },
    [combineActions(
      actions.itemBatch,
      actions.setCacheItemMulti
    ).toString()]: (state: CachedItemsData, action_: any) => {
      // Fails without it for some reason
      const action = action_ as ActionMeta<CachedItem[], { colUid: string, items: Etebase.Item[] }>;
      if (action.payload !== undefined) {
        return state.withMutations((state) => {
          let i = 0;
          for (const item of action.meta.items) {
            state.setIn([action.meta.colUid, item.uid], action.payload[i]);
            i++;
          }
        });
      }
      return state;
    },
    [actions.setCacheCollection.toString()]: (state: CachedItemsData, action: ActionMeta<any, { colUid: string }>) => {
      if (action.payload !== undefined) {
        if (!state.has(action.meta.colUid)) {
          return state.set(action.meta.colUid, ImmutableMap());
        }
      }
      return state;
    },
    [actions.unsetCacheCollection.toString()]: (state: CachedItemsData, action: ActionMeta<any, { colUid: string }>) => {
      if (action.payload !== undefined) {
        return state.remove(action.meta.colUid);
      }
      return state;
    },
    [actions.logout.toString()]: (state: CachedItemsData, _action: any) => {
      return state.clear();
    },
  },
  ImmutableMap({})
);

const fetchActions = [
] as Array<ActionFunctionAny<Action<any>>>;

for (const func in actions) {
  if (func.startsWith("fetch") ||
    func.startsWith("add") ||
    func.startsWith("update") ||
    func.startsWith("delete")) {

    fetchActions.push((actions as any)[func.toString()]);
  }
}

// Indicates network activity, not just fetch
export const fetchCount = handleAction(
  combineActions(
    ...fetchActions
  ),
  (state: number, action: any) => {
    if (action.payload === undefined) {
      return state + 1;
    } else {
      return state - 1;
    }
  },
  0
);

export const errorsReducer = handleActions(
  {
    [actions.performSync.toString()]: (state: List<Error>, action: Action<any>) => {
      if (action.error) {
        return state.push(action.payload);
      }

      return state;
    },
    [actions.addError.toString()]: (state: List<Error>, action: Action<Error>) => {
      return state.push(action.payload);
    },
    [actions.popError.toString()]: (state: List<Error>, _action: Action<any>) => {
      return state.pop();
    },
    [actions.clearErrors.toString()]: (state: List<Error>, _action: Action<any>) => {
      return state.clear();
    },
    [actions.logout.toString()]: (state: List<Error>, _action: any) => {
      return state.clear();
    },
  },
  List<Error>([])
);

export interface ConnectionInfo {
  type: string;
  isConnected: boolean;
}

export const connectionReducer = handleActions(
  {
    [actions.setConnectionInfo.toString()]: (_state: ConnectionInfo | null, action: Action<ConnectionInfo>) => {
      return action.payload;
    },
  },
  null
);

export const syncStatusReducer = handleActions(
  {
    [actions.setSyncStatus.toString()]: (_state: string | null, action: Action<string | null>) => {
      return action.payload;
    },
    [actions.performSync.toString()]: (_state: string | null, action: Action<any>) => {
      if (action.payload === undefined) {
        return "Started sync";
      }
      return null;
    },
  },
  null
);

export const lastSyncReducer = handleActions(
  {
    [actions.performSync.toString()]: (state: Date | null, action: Action<boolean | undefined>) => {
      if (action.payload) {
        return new Date();
      }
      return state;
    },
    [actions.logout.toString()]: (_state: Date | null, _action: any) => {
      return null;
    },
  },
  null
);

export const syncCount = handleAction(
  actions.performSync,
  (state: number, action: any) => {
    if (action.payload === undefined) {
      return state + 1;
    } else {
      return state - 1;
    }
  },
  0
);

export const messagesReducer = handleActions(
  {
    [actions.pushMessage.toString()]: (state: List<Message>, action: Action<Message>) => {
      return state.push(action.payload);
    },
    [actions.popMessage.toString()]: (state: List<Message>, _action: Action<unknown>) => {
      return state.remove(0);
    },
  },
  List([])
);

// FIXME Move all the below (potentially the fetchCount ones too) to their own file
export interface SettingsType {
  locale: string;
  logLevel: LogLevel;
  ranWizrd: boolean;
  theme: "auto" | "dark" | "light";
  fontSize: number;
  viewSettings: {
    viewMode: boolean;
    filterBy: string | null;
    sortBy: "name" | "mtime";
    editorFontFamily: FontFamilyKey;
    viewerFontFamily: FontFamilyKey;
  };
}

export const settingsReducer = handleActions(
  {
    [actions.setSettings.toString()]: (state: SettingsType, action: any) => (
      { ...state, ...action.payload }
    ),
  },
  {
    locale: "en-gb",
    logLevel: LogLevel.Off,
    ranWizrd: false,
    theme: "auto",
    fontSize: 16,
    viewSettings: {
      viewMode: false,
      filterBy: null,
      sortBy: "name",
      editorFontFamily: "monospace",
      viewerFontFamily: "regular",
    },
  }
);
