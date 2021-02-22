import * as React from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Checkbox, FAB, List } from "react-native-paper";
import { useSelector } from "react-redux";
import * as Etebase from "etebase";

import { useSyncGate } from "../SyncGate";
import { StoreState } from "../store";
import { useCredentials } from "../credentials";

import { useLoading } from "../helpers";
import { exportItems } from "../import-export";
import { useTheme } from "../theme";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";

type MetaItem = {
  meta: Etebase.ItemMetadata;
};

function sortName(aIn: MetaItem, bIn: MetaItem) {
  const a = aIn.meta.name!;
  const b = bIn.meta.name!;
  return a.localeCompare(b);
}

type Collection = {
  uid: string;
  name: string;
  items: {
    [uid: string]: Item;
  };
};

type Item = {
  name: string;
};

export default function NoteListScreen() {
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const syncGate = useSyncGate();
  const { colors } = useTheme();
  const etebase = useCredentials()!;
  const [selected, setSelected] = React.useState<{ [colUid: string] : Set<string> }>({});
  const [loading, error, setPromise] = useLoading();

  const entriesList = React.useMemo(() => {
    const ret: Collection[] = [];
    const sel = { ...selected };
    const collections = cacheCollections.sort(sortName);

    for (const [uid, col] of collections.entries()) {
      const items = {};
      const itemsList = cacheItems.get(uid)!.filter((item) => !item.isDeleted).sort(sortName);

      for (const [uid, item] of itemsList.entries()) {
        items[uid] = { name: item.meta.name! };
      }

      ret.push({ uid, name: col.meta.name!, items });
      if (!sel[uid]) {
        sel[uid] = new Set();
      }
    }

    setSelected(sel);
    return ret;
  }, [cacheCollections, cacheItems]);

  const hasSelected = React.useMemo(() => {
    for (const itemList of Object.values(selected)) {
      if (itemList.size > 0) {
        return true;
      }
    }

    return false;
  }, [selected]);

  if (syncGate) {
    return syncGate;
  }

  function renderEntry(params: { item: Collection }) {
    const col = params.item;
    const sel = new Set([...selected[col.uid]]);
    const length = Object.keys(col.items).length;
    const status = (length > 0 && sel?.size === length) ? "checked" : ((sel?.size > 0) ? "indeterminate" : "unchecked");

    return (
      <View style={styles.container}>
        <View style={styles.colCheckboxContainer}>
          <Checkbox.Android
            disabled={length === 0}
            status={status}
            onPress={() => {
              const newSel = { ...selected };
              newSel[col.uid] = (status === "checked") ? new Set() : new Set(Object.keys(col.items));
              setSelected(newSel);
            }}
          />
        </View>
        <View style={styles.accordionContainer}>
          <List.Accordion
            key={col.uid}
            title={col.name}
            left={(props) => <List.Icon {...props} icon="notebook" />}
            style={{ padding: 0 }}
            theme={{ colors: { primary: colors.accentText } }}
          >
            {(length > 0) ? Object.entries(col.items).map(([itemUid, item]) => (
              <List.Item
                key={itemUid}
                title={item.name}
                left={() => (
                  <View style={styles.itemCheckboxContainer}>
                    <Checkbox.Android
                      status={sel?.has(itemUid) ? "checked" : "unchecked"}
                    />
                  </View>
                )}
                onPress={() => {
                  sel.has(itemUid) ? sel.delete(itemUid) : sel.add(itemUid);
                  const newSel = { ...selected };
                  newSel[col.uid] = sel;
                  setSelected(newSel);
                }}
                style={{ padding: 0 }}
              />
            )) : (
              <List.Item
                title="This notebook is empty"
              />
            )}
          </List.Accordion>
        </View>
      </View>
    );
  }

  function onExport() {
    setPromise(async () => {
      const items: Etebase.Item[] = [];
      const colMgr = etebase.getCollectionManager();

      for (const [colUid, itemList] of Object.entries(selected)) {
        const col = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
        const itemMgr = colMgr.getItemManager(col);
        const itemsList = cacheItems.get(colUid)!.filter((_item, uid) => itemList.has(uid));

        for (const cacheItem of itemsList.values()) {
          items.push(itemMgr.cacheLoad(cacheItem!.cache));
        }
      }

      await exportItems(items);
    });
  }

  return (
    <>
      <ErrorOrLoadingDialog
        loading={loading}
        error={error}
        onDismiss={() => setPromise(undefined)}
      />
      <FlatList
        style={[{ backgroundColor: colors.background }, { flex: 1 }]}
        data={entriesList}
        keyExtractor={(item) => item.uid}
        renderItem={renderEntry}
        maxToRenderPerBatch={10}
        ListEmptyComponent={() => (
          <List.Item
            title="No notes"
          />
        )}
      />

      <FAB
        icon="export"
        label="Export"
        color={colors.onAccent}
        style={styles.fab}
        onPress={onExport}
        disabled={!hasSelected || loading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
  },
  colCheckboxContainer: {
    height: 40,
    marginVertical: 8,
    paddingLeft: 16,
  },
  itemCheckboxContainer: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  accordionContainer: {
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
