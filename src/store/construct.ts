// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import { AsyncStorage } from "react-native";
import { NetInfoStateType } from "@react-native-community/netinfo";

import { combineReducers } from "redux";
import { persistReducer, createTransform } from "redux-persist";

import { Map as ImmutableMap } from "immutable";

import {
  SettingsType,
  fetchCount, syncCount, credentials, settingsReducer, syncStatusReducer, lastSyncReducer, connectionReducer, errorsReducer, ErrorsData,
  CredentialsData, SyncCollectionsData, SyncGeneralData,
  collections, items, syncCollections, syncGeneral, CachedCollectionsData, CachedItemsData,
} from "./reducers";

export interface StoreState {
  fetchCount: number;
  syncCount: number;
  syncStatus: string | null;
  settings: SettingsType;
  credentials: CredentialsData;
  sync: {
    collections: SyncCollectionsData;
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
  if ((key === "collections") || (key === "changeQueue")) {
    return state.toJS();
  }

  return state;
};

const syncDeserialize = (state: any, key: string | number) => {
  if ((key === "collections") || (key === "changeQueue")) {
    return ImmutableMap(state);
  }

  return state;
};

const syncPersistConfig = {
  key: "sync",
  storage: AsyncStorage,
  transforms: [createTransform(syncSerialize, syncDeserialize)] as any,
};

const cacheSerialize = (state: any, key: string | number) => {
  if ((key === "collections") || (key === "items")) {
    state.toJS();
  }

  return state;
};

const cacheDeserialize = (state: any, key: string | number) => {
  if (key === "collections") {
    return ImmutableMap(state);
  } else if (key === "items") {
    return ImmutableMap(state).map((item: any) => {
      return ImmutableMap(item);
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
