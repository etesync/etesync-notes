// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { View, TextInput } from "react-native";
import { Appbar } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { useDebouncedCallback } from "use-debounce";

import { useSyncGate } from "../SyncGate";
import { StoreState, useAsyncDispatch } from "../store";
import ScrollView from "../widgets/ScrollView";
import { useCredentials } from "../credentials";

import Markdown from "../widgets/Markdown";
import { useSelector, useDispatch } from "react-redux";
import { setCacheItem, itemBatch, setSettings, setSyncItem, unsetSyncItem } from "../store/actions";
import LoadingIndicator from "../widgets/LoadingIndicator";
import Menu from "../widgets/Menu";
import NoteEditDialog from "../components/NoteEditDialog";

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
  const onSaveDoRef = React.useRef<() => void>();
  const [loading, setLoading] = React.useState(true);
  const [content, setContent_] = React.useState("");
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { viewMode } = viewSettings;
  const [noteEditDialogShow, setNoteEditDialogShow] = React.useState(false);
  const dispatch = useAsyncDispatch();
  const syncDispatch = useDispatch();
  const syncItems = useSelector((state: StoreState) => state.sync.items);
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const etebase = useCredentials()!;
  const navigation = useNavigation();
  const syncGate = useSyncGate();

  function setViewMode(viewMode: boolean) {
    syncDispatch(setSettings({
      viewSettings: {
        ...viewSettings,
        viewMode,
      },
    }));
  }

  const colUid = props.route.params.colUid;
  const itemUid = props.route.params.itemUid;
  const changed = syncItems.hasIn([colUid, itemUid]);
  const cacheItem = cacheItems.get(colUid)!.get(itemUid)!;

  function setChanged(value: boolean) {
    if (changed === value) {
      return;
    }

    if (value) {
      syncDispatch(setSyncItem(colUid, itemUid));
    } else {
      syncDispatch(unsetSyncItem(colUid, itemUid));
    }
  }

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

    return () => {
      onSaveDoRef.current?.();
    };
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
    { maxWait: 10000 }
  );

  async function onSaveDo() {
    if (!changed) {
      return;
    }

    const colMgr = etebase.getCollectionManager();
    const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
    const itemMgr = colMgr.getItemManager(col);
    const item = itemMgr.cacheLoad(cacheItem.cache);
    await item.setContent(content);
    await dispatch(itemBatch(col, itemMgr, [item]));
    setChanged(false);
  }

  onSaveDoRef.current = onSaveDo;

  async function onSave() {
    setLoading(true);
    try {
      await onSaveDo();
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
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSave={onSave}
          onEdit={() => setNoteEditDialogShow(true)}
          changed={changed}
        />
      ),
    });
  }, [navigation, colUid, cacheItem, viewMode, setViewMode, changed]);

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
      <ScrollView keyboardAware contentContainerStyle={{ flexGrow: 1 }}>
        {viewMode ? (
          <Markdown
            content={content}
          />
        ) : (
          <TextInput
            multiline
            textAlignVertical="top"
            style={{ flexGrow: 1 }}
            onChangeText={setContent}
            value={content}
          />
        )}
      </ScrollView>
      <NoteEditDialog
        key={noteEditDialogShow.toString()}
        visible={noteEditDialogShow}
        colUid={colUid}
        item={cacheItem}
        onOk={async (_colUid, name) => {
          const colMgr = etebase.getCollectionManager();
          const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
          const itemMgr = colMgr.getItemManager(col);
          const item = itemMgr.cacheLoad(cacheItem.cache);

          const meta = await item.getMeta();
          meta.name = name;
          meta.mtime = (new Date()).getTime();
          await item.setMeta(meta);

          await dispatch(setCacheItem(col, itemMgr, item));

          setNoteEditDialogShow(false);
        }}
        onDismiss={() => setNoteEditDialogShow(false)}
      />
    </>
  );
}

interface RightActionViewProps {
  viewMode: boolean;
  changed: boolean;
  setViewMode: (value: boolean) => void;
  onEdit: () => void;
  onSave: () => void;
}

function RightAction({ viewMode, setViewMode, onSave, onEdit, changed }: RightActionViewProps) {
  const [showMenu, setShowMenu] = React.useState(false);

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
            onEdit();
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
