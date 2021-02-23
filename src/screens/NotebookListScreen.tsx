import * as React from "react";
import { StyleSheet, FlatList, Platform, View, BackHandler } from "react-native";
import { Appbar as PaperAppbar, List, FAB, Avatar } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import * as Etebase from "etebase";

import { useSyncGate } from "../SyncGate";
import { StoreState } from "../store";
import { SyncManager } from "../sync/SyncManager";
import { performSync } from "../store/actions";
import { useCredentials } from "../credentials";

import NoteList from "../components/NoteList";
import Appbar from "../widgets/Appbar";
import AppbarAction from "../widgets/AppbarAction";
import Menu from "../widgets/Menu";
import MenuItem from "../widgets/MenuItem";
import NotFound from "../widgets/NotFound";
import { defaultColor } from "../helpers";
import { DefaultNavigationProp } from "../NavigationConfig";
import { useTheme } from "../theme";

interface PropsType {
  colUid?: string;
  active: boolean;
}

type Notebook = {
  meta: Etebase.ItemMetadata;
  uid: string;
};

export default function NotebookListScreen(props: PropsType) {
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const notebooks: Notebook[] = React.useMemo(() => Array.from(cacheCollections
    .sort((a, b) => (a.meta!.name!.toUpperCase() >= b.meta!.name!.toUpperCase()) ? 1 : -1)
    .map(({ meta }, uid) => {return { meta, uid }})
    .values()
  ), [cacheCollections]);
  const navigation = useNavigation<DefaultNavigationProp>();
  const syncGate = useSyncGate();
  const theme = useTheme();

  const { colUid, active } = props;
  const cacheCollection = (colUid) ? notebooks.find((col) => col.uid === colUid) : undefined;
  const [notebook, setNotebook] = React.useState(cacheCollection);

  React.useEffect(() => {
    if (!active) {
      return;
    }

    navigation.setOptions({
      header: (props) => <Appbar {...props} menuFallback />,
      title: notebook?.meta.name || "Notebooks",
      headerLeft: (notebook) ? () => <PaperAppbar.BackAction onPress={() => setNotebook(undefined)} /> : undefined,
      headerRight: () => (
        <RightAction colUid={notebook?.uid} />
      ),
    });
  }, [active, navigation, notebook]);

  const onBackPress = React.useCallback(() => {
    if (active && notebook) {
      setNotebook(undefined);
      return true;
    } else {
      return false;
    }
  }, [active, notebook]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => backHandler.remove();
  }, [onBackPress]);

  if (syncGate) {
    return syncGate;
  }

  if (colUid && !cacheCollection) {
    return <NotFound />;
  }

  function renderItem({ item }: { item: Notebook }) {
    return (
      <List.Item
        title={item.meta.name!}
        description={item.meta.description}
        left={({ style }) => (
          <View style={[style, { marginLeft: 10, marginRight: 10, justifyContent: "center" }]}>
            <Avatar.Text size={24} label="" theme={{ colors: { primary: item.meta.color || defaultColor } }} />
          </View>
        )}
        onPress={() => {
          setNotebook(item);
        }}
      />
    );
  }

  return (
    <>
      {notebook ? (
        <NoteList
          colUid={notebook.uid}
          sortBy="name"
        />
      ) : (
        <FlatList
          style={[{ backgroundColor: theme.colors.background }, { flex: 1 }]}
          data={notebooks}
          keyExtractor={(item) => item.uid}
          renderItem={renderItem}
          maxToRenderPerBatch={10}
          ListEmptyComponent={() => (
            <List.Item
              title="No Notebooks"
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        accessibilityLabel="New"
        color={theme.colors.onAccent}
        style={styles.fab}
        onPress={() => navigation.navigate("CollectionCreate")}
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
  const syncDispatch = useDispatch();
  const isSyncing = useSelector((state: StoreState) => state.syncCount) > 0;
  const navigation = useNavigation<DefaultNavigationProp>();
  const { colUid } = props;

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
      {colUid && (
        <Menu
          visible={showMenu}
          onDismiss={() => setShowMenu(false)}
          anchor={(
            <AppbarAction icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
          )}
        >
          <MenuItem icon="notebook" title="Manage Notebook"
            disabled={isSyncing}
            onPress={() => {
              setShowMenu(false);
              navigation.navigate("CollectionChangelog", { colUid });
            }}
          />
        </Menu>
      )}
    </View>
  );
}