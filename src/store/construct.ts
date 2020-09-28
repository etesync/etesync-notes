// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only


import * as Etebase from "etebase";

import { AsyncStorage } from "react-native";
import { NetInfoStateType } from "@react-native-community/netinfo";

import { combineReducers } from "redux";
import { persistReducer, createTransform } from "redux-persist";

import { Map as ImmutableMap } from "immutable";

import {
  SettingsType,
  fetchCount, syncCount, credentials, settingsReducer, syncStatusReducer, lastSyncReducer, connectionReducer, errorsReducer, ErrorsData,
  CredentialsData, SyncCollectionsData, SyncGeneralData,
  collections, items, syncCollections, syncItems, syncGeneral, CachedCollectionsData, CachedItemsData, SyncItemsData,
} from "./reducers";

export interface StoreState {
  fetchCount: number;
  syncCount: number;
  syncStatus: string | null;
  settings: SettingsType;
  credentials: CredentialsData;
  sync: {
    collections: SyncCollectionsData;
    items: SyncItemsData;
    general: SyncGeneralData;

    lastSync: Date | null;
  };
  cache: {
    collections: CachedCollectionsData;
    items: CachedItemsData;
  };
  connection: NetInfoStateType | null;
  errors: ErrorsData;
}

const settingsPersistConfig = {
  key: "settings",
  version: 0,
  storage: AsyncStorage,
};

const credentialsPersistConfig = {
  key: "credentials",
  version: 0,
  storage: AsyncStorage,
};

const syncSerialize = (state: any, key: string | number) => {
  if ((key === "collections") || (key === "items")) {
    return state.toJS();
  }

  return state;
};

const syncDeserialize = (state: any, key: string | number) => {
  if (key === "collections") {
    return ImmutableMap(state);
  } else if (key === "items") {
    return ImmutableMap(state).map((items: any) => {
      return ImmutableMap(items);
    });
  }

  return state;
};

const syncPersistConfig = {
  key: "sync",
  storage: AsyncStorage,
  transforms: [createTransform(syncSerialize, syncDeserialize)] as any,
};

const cacheSerialize = (state: any, key: string | number) => {
  if (key === "collections") {
    const typedState = state as CachedCollectionsData;
    const ret = typedState.map((x) => ({ ...x, cache: Etebase.toBase64(x.cache) }));
    return ret.toJS();
  } else if (key === "items") {
    const typedState = state as CachedItemsData;
    const ret = typedState.map((items) => {
      return items.map((x) => ({ ...x, cache: Etebase.toBase64(x.cache) }));
    });
    return ret.toJS();
  }

  return state;
};

const cacheDeserialize = (state: any, key: string | number) => {
  if (key === "collections") {
    return ImmutableMap<string, any>(state).map((x) => {
      return { ...x, cache: Etebase.fromBase64(x.cache) };
    });
  } else if (key === "items") {
    return ImmutableMap(state).map((item: any) => {
      return ImmutableMap<string, any>(item).map((x) => ({ ...x, cache: Etebase.fromBase64(x.cache) }));
    });
  }

  return state;
};

const cachePersistConfig = {
  key: "cache",
  version: 0,
  storage: AsyncStorage,
  transforms: [createTransform(cacheSerialize, cacheDeserialize)] as any,
};

const reducers = combineReducers({
  fetchCount,
  syncCount,
  syncStatus: syncStatusReducer,
  settings: persistReducer(settingsPersistConfig, settingsReducer),
  credentials: persistReducer(credentialsPersistConfig, credentials),
  sync: persistReducer(syncPersistConfig, combineReducers({
    collections: syncCollections,
    items: syncItems,
    general: syncGeneral,

    lastSync: lastSyncReducer,
  })),
  cache: persistReducer(cachePersistConfig, combineReducers({
    collections,
    items,
  })),
  connection: connectionReducer,
  errors: errorsReducer,
});

export default reducers;
