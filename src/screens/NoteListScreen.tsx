// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import moment from "moment";
import { StyleSheet, FlatList, View } from "react-native";
import { Menu, Appbar, List, useTheme, FAB } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { useSyncGate } from "../SyncGate";
import { CachedItem } from "../store";

import { SyncManager } from "../sync/SyncManager";
import { useAsyncDispatch, StoreState } from "../store";
import { performSync, setCacheItem } from "../store/actions";
import { useCredentials } from "../credentials";
import NewNoteDialog from "../components/NewNoteDialog";
import { NoteMetadata } from "../helpers";


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
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const navigation = useNavigation();
  const syncGate = useSyncGate();
  const theme = useTheme();

  React.useEffect(() => {
    function RightAction() {
      const [showMenu, setShowMenu] = React.useState(false);

      return (
        <View style={{ flexDirection: "row" }}>
          <Appbar.Action icon="sort" accessibilityLabel="Sort" onPress={() => setShowMenu(true)} />
          <Menu
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            anchor={(
              <Appbar.Action icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
            )}
          >
            <Menu.Item icon="notebook" title="New Notebook"
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("CollectionEdit", {});
              }}
            />
            <Menu.Item icon="sync" title="Sync"
              onPress={() => {
                setShowMenu(false);
                const syncManager = SyncManager.getManager(etebase);
                dispatch(performSync(syncManager.sync())); // not awaiting on puprose
              }}
            />
          </Menu>
        </View>
      );
    }

    navigation.setOptions({
      headerRight: () => (
        <RightAction />
      ),
    });
  }, [etebase, navigation]);

  const entriesList = React.useMemo(() => {
    const ret: (CachedItem & { colUid: string, uid: string })[] = [];
    for (const [colUid, itemLists] of cacheItems.entries()) {
      for (const [uid, item] of itemLists.entries()) {
        ret.push({ ...item, uid, colUid });
      }
    }
    return ret;
  }, [cacheItems]);

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
      />

      <NewNoteDialog
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
          navigation.navigate("ItemEdit", { colUid, itemUid: item.uid });
          setNewItemDialogShow(false);
        }}
        onDismiss={() => setNewItemDialogShow(false)}
      />
      <FAB
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
