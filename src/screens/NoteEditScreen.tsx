// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { View, ViewProps, KeyboardAvoidingView, Platform } from "react-native";
import { Appbar, Paragraph, useTheme } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useDebouncedCallback } from "use-debounce";

import { useSyncGate } from "../SyncGate";
import { StoreState, useAsyncDispatch } from "../store";
import ScrollView from "../widgets/ScrollView";
import RawTextInput from "../widgets/RawTextInput";
import { useCredentials } from "../credentials";

import Markdown from "../widgets/Markdown";
import { useSelector, useDispatch } from "react-redux";
import { setCacheItem, itemBatch, setSettings, setSyncItem, unsetSyncItem } from "../store/actions";
import LoadingIndicator from "../widgets/LoadingIndicator";
import Menu from "../widgets/Menu";
import ConfirmationDialog from "../widgets/ConfirmationDialog";
import NotFound from "../widgets/NotFound";
import { fontFamilies } from "../helpers";
import { RootStackParamList } from "../RootStackParamList";
import { canShare, shareItem } from "../import-export";

type NavigationProp = StackNavigationProp<RootStackParamList, "NoteEdit">;

interface PropsType {
  route: RouteProp<RootStackParamList, "NoteEdit">;
}

export default function NoteEditScreen(props: PropsType) {
  const onSaveDoRef = React.useRef<() => void>();
  const [loading, setLoading] = React.useState(true);
  const [content, setContent_] = React.useState("");
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { defaultViewMode, lastViewMode } = viewSettings;
  const [viewMode, setViewMode] = React.useState((defaultViewMode === "last") ? lastViewMode : (defaultViewMode === "viewer"));
  const [noteDeleteDialogShow, setNoteDeleteDialogShow] = React.useState(false);
  const dispatch = useAsyncDispatch();
  const syncDispatch = useDispatch();
  const syncItems = useSelector((state: StoreState) => state.sync.items);
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const etebase = useCredentials()!;
  const navigation = useNavigation<NavigationProp>();
  const syncGate = useSyncGate();

  const { colUid, itemUid } = props.route.params;
  const cacheCollection = (colUid) ? cacheItems.get(colUid) : undefined;
  const cacheItem = (cacheCollection && itemUid) ? cacheCollection.get(itemUid) : undefined;

  const changed = syncItems.hasIn([colUid, itemUid]);

  React.useEffect(() => {
    return () => {
      onSaveDoRef.current?.();
    };
  }, []);

  React.useEffect(() => {
    if (syncGate || !cacheItem) {
      return;
    }

    (async () => {
      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem.cache);
      const content = await item.getContent(Etebase.OutputFormat.String);
      setContent_(content);
      setLoading(false);
    })();
  }, [syncGate, colUid, itemUid]);

  React.useEffect(() => {
    navigation.setOptions({
      title: cacheItem?.meta.name ?? "Note Not Found",
      headerRight: () => (
        <RightAction
          viewMode={viewMode}
          setViewMode={setLastViewMode}
          onSave={onSave}
          onEdit={() => navigation.navigate("NoteProps", { colUid, itemUid })}
          onDelete={() => setNoteDeleteDialogShow(true)}
          onShare={onShare}
          changed={changed}
        />
      ),
    });
  }, [navigation, colUid, cacheItem, viewMode, setLastViewMode, changed]);

  const persistItem = useDebouncedCallback(
    async (content: string) => {
      if (!etebase) {
        return;
      }

      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem!.cache);

      const meta = item.getMeta();
      meta.mtime = (new Date()).getTime();
      item.setMeta(meta);
      await item.setContent(content);

      await dispatch(setCacheItem(col, itemMgr, item));
    },
    1000,
    // The max wait time:
    { maxWait: 10000 }
  );

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

  function setContent(content: string) {
    setChanged(true);
    persistItem.callback(content);
    setContent_(content);
  }

  async function onSaveDo() {
    if (!changed) {
      return;
    }

    const colMgr = etebase.getCollectionManager();
    const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
    const itemMgr = colMgr.getItemManager(col);
    const item = itemMgr.cacheLoad(cacheItem!.cache);
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

  function setLastViewMode(viewMode: boolean) {
    setViewMode(viewMode);
    syncDispatch(setSettings({
      viewSettings: {
        ...viewSettings,
        lastViewMode: viewMode,
      },
    }));
  }

  function onShare() {
    (async () => {
      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
      const itemMgr = colMgr.getItemManager(col);
      const item = itemMgr.cacheLoad(cacheItem!.cache);
      await shareItem(item);
    })();
  }

  if (syncGate) {
    return syncGate;
  }
  
  if (!cacheCollection) {
    return <NotFound />;
  }
  if (!cacheItem) {
    return <NotFound message="This note can't be found" />;
  }

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      {viewMode ? (
        <ScrollView keyboardAware contentContainerStyle={{ flexGrow: 1, padding: 10 }}>
          <Markdown
            setContent={setContent}
            content={content}
          />
        </ScrollView>
      ) : (
        <TextEditor
          style={{ flexGrow: 1 }}
          contentStyle={{ padding: 10 }}
          setContent={setContent}
          content={content}
        />
      )}
      <ConfirmationDialog
        title="Delete Note"
        visible={noteDeleteDialogShow}
        onOk={async () => {
          const colMgr = etebase.getCollectionManager();
          const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
          const itemMgr = colMgr.getItemManager(col);
          const item = itemMgr.cacheLoad(cacheItem.cache);

          const meta = item.getMeta();
          meta.mtime = (new Date()).getTime();
          item.setMeta(meta);
          item.delete(true);

          await dispatch(setCacheItem(col, itemMgr, item));
          navigation.goBack();
        }}
        onCancel={() => setNoteDeleteDialogShow(false)}
      >
        <Paragraph>Are you sure you would like to delete this note?</Paragraph>
      </ConfirmationDialog>
    </>
  );
}

interface RightActionViewProps {
  viewMode: boolean;
  changed: boolean;
  setViewMode: (value: boolean) => void;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function RightAction({ viewMode, setViewMode, onSave, onEdit, onDelete, onShare, changed }: RightActionViewProps) {
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
        <Menu.Item icon="pencil" title="Edit Properties"
          onPress={() => {
            setShowMenu(false);
            onEdit();
          }}
        />
        <Menu.Item icon="delete" title="Delete"
          onPress={() => {
            setShowMenu(false);
            onDelete();
          }}
        />
        <Menu.Item icon="content-save" title="Save"
          disabled={!changed}
          onPress={() => {
            setShowMenu(false);
            onSave();
          }}
        />
        {(canShare()) ? (
          <Menu.Item icon="share-variant" title="Share"
            onPress={() => {
              setShowMenu(false);
              onShare();
            }}
          />
        ) : null}
      </Menu>
    </View>
  );
}

interface TextEditorPropsType extends ViewProps {
  content: string;
  setContent: (value: string) => void;
  contentStyle?: ViewProps["style"];
}

function TextEditor(props: TextEditorPropsType) {
  const { content, setContent } = props;
  const fontSize = useSelector((state: StoreState) => state.settings.fontSize);
  const fontFamilyKey = useSelector((state: StoreState) => state.settings.viewSettings.editorFontFamily);
  const fontFamily = fontFamilies[fontFamilyKey];
  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      enabled={(Platform.OS === "ios")}
      style={[{ backgroundColor: theme.colors.background }, props.style]}
    >
      <RawTextInput
        textAlignVertical="top"
        multiline
        scrollEnabled
        style={[{ flexGrow: 1, fontSize, fontFamily }, props.contentStyle]}
        onChangeText={setContent}
        value={content}
      />
    </KeyboardAvoidingView>
  );
}
