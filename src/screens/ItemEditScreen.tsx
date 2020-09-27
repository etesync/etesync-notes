// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { View, TextInput } from "react-native";
import { Menu, Appbar } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { useDebouncedCallback } from "use-debounce";

import { useSyncGate } from "../SyncGate";
import { CachedItem } from "../store";
import ScrollView from "../widgets/ScrollView";
import { useCredentials } from "../credentials";

import Markdown from "../widgets/Markdown";

interface ItemState {
  item: Etebase.Item;
  itemMgr: Etebase.ItemManager;
}

type RootStackParamList = {
  ItemEditScreen: {
    colUid: string;
    itemUid?: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "ItemEditScreen">;
}

export default function ItemEditScreen(props: PropsType) {
  const [itemState_, setItemState] = React.useState<ItemState>();
  const [content, setContent_] = React.useState(""); // FIXME: Set something from the item
  const [viewMode, setViewMode] = React.useState(false);
  const etebase = useCredentials();
  const navigation = useNavigation();
  const syncGate = useSyncGate();

  const colUid = props.route.params.colUid;
  const itemUid = props.route.params.itemUid;

  const persistItem = useDebouncedCallback(
    async (content: string) => {
      if (!etebase) {
        return;
      }

      const mtime = (new Date()).getTime();
      let itemState: ItemState;
      if (itemState_) {
        itemState = itemState_;
        const item = itemState.item;
        const meta = await item.getMeta();
        meta.mtime = mtime;
        await item.setMeta(meta);
        await item.setContent(content);
      } else {
        const colMgr = etebase.getCollectionManager();
        const col = await localCache.collectionGet(colMgr, colUid);
        const itemMgr = colMgr.getItemManager(col!);

        const meta: Etebase.ItemMetadata = {
          name: "FIXME: some name", // FIXME
          mtime,
        };

        itemState = {
          itemMgr,
          item: await itemMgr.create(meta, content),
        };
        setItemState(itemState);
      }
      // FIXME: mark item as changed in the store
    },
    1000,
    // The max wait time:
    { maxWait: 5000 }
  );

  React.useEffect(() => {
    navigation.setOptions({
      title: "FIXME: item's name.", // FIXME: maybe have an underbar with the name...
      headerRight: () => (
        <RightAction
          colUid={colUid}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      ),
    });
  }, [navigation, colUid, viewMode, setViewMode]);

  function setContent(content: string) {
    persistItem.callback(content);
    setContent_(content);
  }

  if (syncGate) {
    return syncGate;
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
  setViewMode: (value: boolean) => void;
}

function RightAction({ colUid, viewMode, setViewMode }: RightActionViewProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const navigation = useNavigation();

  return (
    <View style={{ flexDirection: "row" }}>
      <Appbar.Action icon={viewMode ? "pencil" : "eye"} accessibilityLabel="View mode" onPress={() => {
        console.log("Yoo", viewMode);
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
        <Menu.Item icon="sync" title="Sync"
          onPress={() => {
            setShowMenu(false);
            navigation.navigate("CollectionMembers", { colUid });
          }}
        />
      </Menu>
    </View>
  );
}
