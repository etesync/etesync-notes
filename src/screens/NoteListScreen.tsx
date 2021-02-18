// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import moment from "moment";
import { StyleSheet, FlatList, View, Platform } from "react-native";
import { FAB, List } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import { useSyncGate } from "../SyncGate";
import { CachedItem, StoreState } from "../store";
import { SyncManager } from "../sync/SyncManager";
import { performSync, setSettings } from "../store/actions";
import { useCredentials } from "../credentials";

import Appbar from "../widgets/Appbar";
import Menu from "../widgets/Menu";
import MenuItem from "../widgets/MenuItem";
import NotFound from "../widgets/NotFound";
import AppbarAction from "../widgets/AppbarAction";
import Link from "../widgets/Link";
import { DefaultNavigationProp } from "../RootStackParamList";
import { useTheme } from "../theme";


function sortMtime(aIn: CachedItem, bIn: CachedItem) {
  const a = aIn.meta.mtime!;
  const b = bIn.meta.mtime!;
  return (a > b) ? -1 : (a < b) ? 1 : 0;
}

function sortName(aIn: CachedItem, bIn: CachedItem) {
  const a = aIn.meta.name!;
  const b = bIn.meta.name!;
  return a.localeCompare(b);
}

function getSortFunction(sortOrder: string) {
  const sortFunctions: (typeof sortName)[] = [];

  switch (sortOrder) {
    case "mtime":
      // Do nothing because it's the last sort function anyway
      break;
    case "name":
      sortFunctions.push(sortName);
      break;
  }

  sortFunctions.push(sortMtime);

  return (a: CachedItem, b: CachedItem) => {
    for (const sortFunction of sortFunctions) {
      const ret = sortFunction(a, b);
      if (ret !== 0) {
        return ret;
      }
    }

    return 0;
  };
}

interface PropsType {
  active: boolean;
  colUid?: string;
}

export default function NoteListScreen(props: PropsType) {
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { sortBy } = viewSettings;
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const navigation = useNavigation<DefaultNavigationProp>();
  const syncGate = useSyncGate();
  const theme = useTheme();

  const { active, colUid } = props;
  const cacheCollection = (colUid) ? cacheCollections.get(colUid) : undefined;

  React.useEffect(() => {
    if (!active) {
      return;
    }

    navigation.setOptions({
      header: (props) => <Appbar {...props} menuFallback />,
      title: cacheCollection?.meta.name ?? "All Notes",
      headerRight: () => (
        <RightAction colUid={colUid} />
      ),
    });
  }, [active, navigation, cacheCollections, colUid]);

  const entriesList = React.useMemo(() => {
    const filterByUid = colUid;

    const ret: (CachedItem & { colUid: string, uid: string })[] = [];
    for (const [colUid, itemLists] of cacheItems.entries()) {
      if (filterByUid && (filterByUid !== colUid)) {
        continue;
      }

      for (const [uid, item] of itemLists.entries()) {
        if (item.isDeleted) {
          continue;
        }

        ret.push({ ...item, uid, colUid });
      }
    }
    return ret.sort(getSortFunction(sortBy));
  }, [cacheItems, sortBy, colUid]);

  if (syncGate) {
    return syncGate;
  }

  if (colUid && !cacheCollection) {
    return <NotFound />;
  }

  function renderEntry(param: { item: CachedItem & { colUid: string, uid: string } }) {
    const item = param.item;
    const name = item.meta.name!;
    const mtime = (item.meta.mtime) ? moment(item.meta.mtime) : undefined;

    return (
      <Link
        key={item.uid}
        to={`/notebook/${item.colUid}/note/${item.uid}`}
        renderChild={(props) => (
          <List.Item
            {...props}
            title={name}
            description={mtime?.format("llll")}
          />
        )}
      />
    );
  }

  return (
    <>
      <FlatList
        style={[{ backgroundColor: theme.colors.background }, { flex: 1 }]}
        data={entriesList}
        keyExtractor={(item) => item.uid}
        renderItem={renderEntry}
        maxToRenderPerBatch={10}
        ListEmptyComponent={() => (
          <List.Item
            title="Notebook is empty"
          />
        )}
      />

      <FAB
        icon="plus"
        accessibilityLabel="New"
        color={theme.colors.onAccent}
        style={styles.fab}
        onPress={() => navigation.navigate("NoteCreate", colUid ? { colUid } : undefined)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

interface RightActionPropsType {
  colUid?: string;
}

function RightAction(props: RightActionPropsType) {
  const etebase = useCredentials()!;
  const [showMenu, setShowMenu] = React.useState(false);
  const [showSortMenu, setShowSortMenu_] = React.useState(false);
  const syncDispatch = useDispatch();
  const isSyncing = useSelector((state: StoreState) => state.syncCount) > 0;
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const navigation = useNavigation<DefaultNavigationProp>();
  const { colUid } = props;

  function setShowSortMenu(value: boolean) {
    setShowSortMenu_(value);
    setShowMenu(value);
  }

  async function refresh() {
    const syncManager = SyncManager.getManager(etebase!);
    syncDispatch(performSync(syncManager.sync())); // not awaiting on puprose
  }

  useFocusEffect(React.useCallback(() => {
    if (!etebase) {
      return () => true;
    }

    refresh();

    if (Platform.OS !== "web") {
      return () => true;
    }

    function autoRefresh() {
      if (navigator.onLine && etebase) {
        refresh();
      }
    }

    const interval = 5 * 60 * 1000;
    const id = setInterval(autoRefresh, interval);
    return () => clearInterval(id);
  }, [etebase]));

  return (
    <View style={{ flexDirection: "row" }}>
      <AppbarAction icon="sync" accessibilityLabel="Sync"
        disabled={isSyncing}
        onPress={() => {
          setShowMenu(false);
          refresh();
        }}
      />
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={(
          <AppbarAction icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
        )}
      >
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={(
            <Menu.Item icon="sort" title="Sort by"
              disabled={isSyncing}
              onPress={() => {
                setShowSortMenu(true);
              }}
            />
          )}
        >
          <MenuItem icon="sort-alphabetical" title="Name"
            disabled={isSyncing}
            active={viewSettings.sortBy === "name"}
            onPress={() => {
              setShowSortMenu(false);
              syncDispatch(setSettings({
                viewSettings: {
                  ...viewSettings,
                  sortBy: "name",
                },
              }));
            }}
          />
          <MenuItem icon="sort-numeric" title="Modification time"
            disabled={isSyncing}
            active={viewSettings.sortBy === "mtime"}
            onPress={() => {
              setShowSortMenu(false);
              syncDispatch(setSettings({
                viewSettings: {
                  ...viewSettings,
                  sortBy: "mtime",
                },
              }));
            }}
          />
        </Menu>
        {colUid && (
          <MenuItem icon="notebook" title="Manage Notebook"
            disabled={isSyncing}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate("CollectionChangelog", { colUid });
            }}
          />
        )}
      </Menu>
    </View>
  );
}
