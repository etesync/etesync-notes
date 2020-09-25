// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import { Action, ActionMeta, ActionFunctionAny, combineActions, handleAction, handleActions } from "redux-actions";

import { List, Map as ImmutableMap } from "immutable";

import * as Etebase from "etebase";

import * as actions from "./actions";
import { LogLevel } from "../logging";

interface BaseModel {
  uid: string;
}


export interface ErrorsData {
  fatal: List<Error>;
  other: List<Error>;
}

export interface SyncCollectionsEntryData extends BaseModel {
  stoken: string;
}

export type SyncCollectionsData = ImmutableMap<string, SyncCollectionsEntryData>;

export type DecryptedItem = { meta: Etebase.ItemMetadata, content: string, isDeleted: boolean };
export type DecryptedItems = ImmutableMap<string, DecryptedItem>;
export type DecryptedItemsData = ImmutableMap<string, DecryptedItems>;
export type DecryptedCollection = { meta: Etebase.CollectionMetadata };
export type DecryptedCollectionsData = ImmutableMap<string, DecryptedCollection>;

export type SyncGeneralData = {
  stoken?: string | null;
  lastSyncDate?: Date;
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
    ).toString()]: (state: DecryptedCollectionsData, action: ActionMeta<DecryptedCollection, { colUid: string, deleted: boolean }>) => {
      if (action.payload !== undefined) {
        if (action.meta.deleted) {
          return state.remove(action.meta.colUid);
        } else {
          return state.set(action.meta.colUid, action.payload);
        }
      }
      return state;
    },
    [actions.logout.toString()]: (state: DecryptedCollectionsData, _action: any) => {
      return state.clear();
    },
  },
  ImmutableMap({})
);

export const items = handleActions(
  {
    [combineActions(
      actions.setCacheItem
    ).toString()]: (state: DecryptedItemsData, action: ActionMeta<DecryptedItem, { colUid: string, itemUid: string }>) => {
      if (action.payload !== undefined) {
        return state.setIn([action.meta.colUid, action.meta.itemUid], action.payload);
      }
      return state;
    },
    [combineActions(
      actions.itemBatch,
      actions.setCacheItemMulti
    ).toString()]: (state: DecryptedItemsData, action_: any) => {
      // Fails without it for some reason
      const action = action_ as ActionMeta<DecryptedItem[], { colUid: string, items: Etebase.Item[] }>;
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
    [actions.setCacheCollection.toString()]: (state: DecryptedItemsData, action: ActionMeta<any, { colUid: string }>) => {
      if (action.payload !== undefined) {
        if (!state.has(action.meta.colUid)) {
          return state.set(action.meta.colUid, ImmutableMap());
        }
      }
      return state;
    },
    [actions.unsetCacheCollection.toString()]: (state: DecryptedItemsData, action: ActionMeta<any, { colUid: string }>) => {
      if (action.payload !== undefined) {
        return state.remove(action.meta.colUid);
      }
      return state;
    },
    [actions.logout.toString()]: (state: DecryptedItemsData, _action: any) => {
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
    [actions.performSync.toString()]: (state: ErrorsData, action: Action<any>) => {
      if (action.error) {
        return {
          ...state,
          fatal: state.fatal.push(action.payload),
        };
      }

      return state;
    },
    [actions.addNonFatalError.toString()]: (state: ErrorsData, action: Action<Error>) => {
      return {
        ...state,
        other: state.other.push(action.payload),
      };
    },
    [actions.popNonFatalError.toString()]: (state: ErrorsData, _action: Action<any>) => {
      return {
        ...state,
        other: state.other.pop(),
      };
    },
    [actions.clearErros.toString()]: (state: ErrorsData, _action: Action<any>) => {
      return {
        fatal: state.fatal.clear(),
        other: state.other.clear(),
      };
    },
    [actions.logout.toString()]: (state: ErrorsData, _action: any) => {
      return {
        fatal: state.fatal.clear(),
        other: state.other.clear(),
      };
    },
  },
  {
    fatal: List<Error>([]),
    other: List<Error>([]),
  }
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

// FIXME Move all the below (potentially the fetchCount ones too) to their own file
export interface SettingsType {
  locale: string;
  logLevel: LogLevel;
  syncContactsContainer: string | null;
  syncCalendarsSource: string | null;
  ranWizrd: boolean;
}

export const settingsReducer = handleActions(
  {
    [actions.setSettings.toString()]: (state: SettingsType, action: any) => (
      { ...state, ...action.payload }
    ),
  },
  { locale: "en-gb", logLevel: LogLevel.Off, syncContactsContainer: null, syncCalendarsSource: null, ranWizrd: false }
);
