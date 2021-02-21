import * as React from "react";
import moment from "moment";
import { FlatList } from "react-native";
import { List } from "react-native-paper";
import { useSelector } from "react-redux";

import { useSyncGate } from "../SyncGate";
import { CachedItem, StoreState } from "../store";

import NotFound from "../widgets/NotFound";
import Link from "../widgets/Link";
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
  colUid?: string;
  sortBy: "name" | "mtime";
}

export default function NoteList(props: PropsType) {
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const cacheItems = useSelector((state: StoreState) => state.cache.items);
  const syncGate = useSyncGate();
  const theme = useTheme();

  const { sortBy } = props;
  const colUid = props.colUid || undefined;
  const cacheCollection = (colUid) ? cacheCollections.get(colUid) : undefined;

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
  );
}
