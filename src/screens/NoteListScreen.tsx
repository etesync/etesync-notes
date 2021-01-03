// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import moment from "moment";
import { StyleSheet, FlatList, View, Platform } from "react-native";
import { Appbar, List, useTheme, FAB } from "react-native-paper";
import { useNavigation, useFocusEffect, RouteProp } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";

import { useSyncGate } from "../SyncGate";
import { CachedItem } from "../store";

import { SyncManager } from "../sync/SyncManager";
import { useAsyncDispatch, StoreState } from "../store";
import { performSync, setCacheItem, setSettings, setSyncItem } from "../store/actions";
import { useCredentials } from "../credentials";
import NoteEditDialog from "../components/NoteEditDialog";
import { NoteMetadata, navigateTo404 } from "../helpers";
import Menu from "../widgets/Menu";


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

type RootStackParamList = {
  NoteListScreen: {
    colUid?: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "NoteListScreen">;
}

export default function NoteListScreen(props: PropsType) {
  const etebase = useCredentials()!;
  const dispatch = useAsyncDispatch();
  const [newItemDialogShow, setNewItemDialogShow] = React.useState(false);
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { sortBy } = viewSettings;
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const navigation = useNavigation();
  const syncGate = useSyncGate();
  const theme = useTheme();

  const colUid = props.route.params?.colUid;
  const cacheCollection = (colUid && colUid.length > 0) ? cacheCollections.get(colUid) : undefined;
  
  if (colUid && colUid.length > 0 && cacheCollection == null) {
    navigateTo404(navigation);
    return null;
  }

  React.useEffect(() => {

    navigation.setOptions({
      title: cacheCollection?.meta.name ?? "All Notes",
      headerRight: () => (
        <RightAction colUid={colUid} />
      ),
    });
  }, [navigation, cacheCollections, colUid]);

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

  function renderEntry(param: { item: CachedItem & { colUid: string, uid: string } }) {
    const item = param.item;
    const name = item.meta.name!;
    const mtime = (item.meta.mtime) ? moment(item.meta.mtime) : undefined;

    return (
      <List.Item
        key={item.uid}
        title={name}
        description={mtime?.format("llll")}
        onPress={() => { navigation.navigate("ItemEdit", { colUid: item.colUid, itemUid: item.uid }) }}
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

      <NoteEditDialog
        key={newItemDialogShow.toString()}
        visible={newItemDialogShow}
        onOk={async (colUid, name) => {
          const colMgr = etebase.getCollectionManager();
          const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
          const itemMgr = colMgr.getItemManager(col);
          const meta: NoteMetadata = {
            name,
            mtime: (new Date()).getTime(),
          };
          const item = await itemMgr.create(meta, "");
          await dispatch(setCacheItem(col, itemMgr, item));
          dispatch(setSyncItem(colUid, item.uid));
          navigation.navigate("ItemEdit", { colUid, itemUid: item.uid });
          setNewItemDialogShow(false);
        }}
        initialColUid={colUid}
        onDismiss={() => setNewItemDialogShow(false)}
      />
      <FAB
        visible={!newItemDialogShow}
        icon="plus"
        accessibilityLabel="New"
        color="white"
        style={styles.fab}
        onPress={() => setNewItemDialogShow(true)}
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
  const selecetdStyle = { color: "green" };
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const navigation = useNavigation();
  const { colUid } = props;

  function setShowSortMenu(value: boolean) {
    setShowSortMenu_(value);
    setShowMenu(value);
  }

  async function refresh() {
    const syncManager = SyncManager.getManager(etebase!);
    const sync = syncManager.sync();
    syncDispatch(performSync(syncManager.sync())); // not awaiting on puprose
    await sync;
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
      <Appbar.Action icon="sync" accessibilityLabel="Sync"
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
          <Appbar.Action icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
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
          <Menu.Item icon="sort-alphabetical" title="Name"
            disabled={isSyncing}
            titleStyle={
              (viewSettings.sortBy === "name") ? selecetdStyle : undefined
            }
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
          <Menu.Item icon="sort-numeric" title="Modification time"
            disabled={isSyncing}
            titleStyle={
              (viewSettings.sortBy === "mtime") ? selecetdStyle : undefined
            }
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
          <Menu.Item icon="notebook" title="Manage Notebook"
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
