// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { View, TextInput } from "react-native";
import { Menu, Appbar } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { useDebouncedCallback } from "use-debounce";

import { useSyncGate } from "../SyncGate";
import { StoreState, useAsyncDispatch } from "../store";
import ScrollView from "../widgets/ScrollView";
import { useCredentials } from "../credentials";

import Markdown from "../widgets/Markdown";
import { useSelector } from "react-redux";
import { setCacheItem, itemBatch } from "../store/actions";
import LoadingIndicator from "../widgets/LoadingIndicator";

type RootStackParamList = {
  ItemEditScreen: {
    colUid: string;
    itemUid: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "ItemEditScreen">;
}

export default function ItemEditScreen(props: PropsType) {
  const [loading, setLoading] = React.useState(true);
  const [changed, setChanged] = React.useState(false);
  const [content, setContent_] = React.useState("");
  const [viewMode, setViewMode] = React.useState(false);
  const dispatch = useAsyncDispatch();
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const etebase = useCredentials()!;
  const navigation = useNavigation();
  const syncGate = useSyncGate();

  const colUid = props.route.params.colUid;
  const itemUid = props.route.params.itemUid;
  const cacheItem = cacheItems.get(colUid)!.get(itemUid)!;

  React.useEffect(() => {
    (async () => {
      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem.cache);
      const content = await item.getContent(Etebase.OutputFormat.String);
      setContent_(content);
      setLoading(false);
    })();
  }, []);

  const persistItem = useDebouncedCallback(
    async (content: string) => {
      if (!etebase) {
        return;
      }

      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem.cache);

      const meta = await item.getMeta();
      meta.mtime = (new Date()).getTime();
      await item.setMeta(meta);
      await item.setContent(content);

      await dispatch(setCacheItem(col, itemMgr, item));
    },
    1000,
    // The max wait time:
    { maxWait: 5000 }
  );

  async function onSave() {
    setLoading(true);
    try {
      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem.cache);
      await item.setContent(content);
      await dispatch(itemBatch(col, itemMgr, [item]));
      setChanged(false);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    navigation.setOptions({
      title: cacheItem.meta.name,
      headerRight: () => (
        <RightAction
          colUid={colUid}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSave={onSave}
          changed={changed}
        />
      ),
    });
  }, [navigation, colUid, viewMode, setViewMode, changed]);

  function setContent(content: string) {
    setChanged(true);
    persistItem.callback(content);
    setContent_(content);
  }

  if (syncGate) {
    return syncGate;
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <ScrollView keyboardAware>
        {viewMode ? (
          <Markdown
            content={content}
          />
        ) : (
          <TextInput
            multiline
            style={{ flexGrow: 1 }}
            onChangeText={setContent}
            value={content}
          />
        )}
      </ScrollView>
    </>
  );
}

interface RightActionViewProps {
  colUid: string;
  viewMode: boolean;
  changed: boolean;
  setViewMode: (value: boolean) => void;
  onSave: () => void;
}

function RightAction({ colUid, viewMode, setViewMode, onSave, changed }: RightActionViewProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: "row" }}>
      <Appbar.Action icon={viewMode ? "pencil" : "eye"} accessibilityLabel="View mode" onPress={() => {
        setViewMode(!viewMode);
      }} />
      <Menu
        visible={showMenu}
        onDismiss={() => setShowMenu(false)}
        anchor={(
          <Appbar.Action icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
        )}
      >
        <Menu.Item icon="pencil" title="Edit"
          onPress={() => {
            setShowMenu(false);
            navigation.navigate("CollectionEdit", { colUid });
          }}
        />
        <Menu.Item icon="content-save" title="Save"
          disabled={!changed}
          onPress={() => {
            setShowMenu(false);
            onSave();
          }}
        />
      </Menu>
    </View>
  );
}
