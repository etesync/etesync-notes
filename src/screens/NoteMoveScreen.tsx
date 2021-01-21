// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { Text, HelperText, Button, TouchableRipple } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useSyncGate } from "../SyncGate";
import { useCredentials } from "../credentials";
import { StoreState, useAsyncDispatch } from "../store";
import { itemBatch, pushMessage } from "../store/actions";
import { CachedItem } from "../store/reducers";

import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";
import Select from "../widgets/Select";
import TextInputWithIcon from "../widgets/TextInputWithIcon";
import NotFound from "../widgets/NotFound";

import { useLoading } from "../helpers";
import { RootStackParamList } from "../RootStackParamList";

interface FormErrors {
  notebook?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, "NoteProps">;

interface PropsType {
  route: RouteProp<RootStackParamList, "NoteMove">;
}

export default function NotePropertiesScreen(props: PropsType) {
  const colUid = props.route.params?.colUid;
  const itemUid = props.route.params?.itemUid;
  const [errors, setErrors] = React.useState({} as FormErrors);
  const [selectOpen, setSelectOpen] = React.useState(false);
  const dispatch = useAsyncDispatch();
  const cachedCollections = useSelector((state: StoreState) => state.cache.collections);
  const cachedItems = useSelector((state: StoreState) => state.cache.items);
  const [cachedItem, setCachedItem] = React.useState<CachedItem | undefined>();
  const options = Array.from(
    cachedCollections.map((val, uid) => ({ ...val, uid }))
      .sort((a, b) => (a.meta!.name!.toUpperCase() >= b.meta!.name!.toUpperCase()) ? 1 : -1)
      .values()
  );
  const [collection, setCollection] = React.useState((options.length > 0) ? options[0] : undefined);
  const syncGate = useSyncGate();
  const navigation = useNavigation<NavigationProp>();
  const etebase = useCredentials()!;
  const [loading, error, setPromise] = useLoading();

  React.useEffect(() => {
    if (syncGate) {
      return;
    }

    if (colUid) {
      const cachedCollection = cachedItems.get(colUid);

      if (cachedCollection) {
        setCollection(options.find((x) => x.uid === colUid) ?? options[0]);

        if (itemUid) {
          const cachedItem = cachedCollection.get(itemUid);
          if (cachedItem) {
            setCachedItem(cachedItem);
          } else {
            setCachedItem(undefined);
          }
        }
      } else {
        setCollection(undefined);
      }
    }

  }, [syncGate, cachedItems, colUid, itemUid]);

  React.useEffect(() => {
    navigation.setOptions({
      title: "Move Note",
    });
  }, [colUid, itemUid]);

  if (syncGate) {
    return syncGate;
  }

  if (colUid && !collection) {
    return <NotFound />;
  }
  if (itemUid && !cachedItem) {
    return <NotFound message="This note can't be found" />;
  }

  function onMove() {
    setPromise(async () => {
      const saveErrors: FormErrors = {};
      const fieldRequired = "This field is required!";

      if (!collection) {
        saveErrors.notebook = fieldRequired;
      } else if (collection.uid === colUid) {
        saveErrors.notebook = "You must pick a different notebook to move the note!";
      }

      if (Object.keys(saveErrors).length > 0) {
        setErrors(saveErrors);
        return;
      }

      const colMgr = etebase.getCollectionManager();
      
      const oldCollection = cachedCollections.get(colUid!)!;
      const oldCol = colMgr.cacheLoad(oldCollection.cache);
      const oldItemMgr = colMgr.getItemManager(oldCol);
      const oldItem = oldItemMgr.cacheLoad(cachedItem!.cache);

      const newCol = colMgr.cacheLoad(collection!.cache);
      const newItemMgr = colMgr.getItemManager(newCol);

      const meta = oldItem.getMeta();
      meta.mtime = (new Date()).getTime();
      const content = await oldItem.getContent();
      const newItem = await newItemMgr.create(meta, content);
      await dispatch(itemBatch(newCol, newItemMgr, [newItem]));

      oldItem.setMeta(meta);
      oldItem.delete(true);
      await dispatch(itemBatch(oldCol, oldItemMgr, [oldItem]));

      dispatch(pushMessage({ message: "Note moved", severity: "success" }));
      navigation.navigate("NoteEdit", { colUid: collection!.uid, itemUid: newItem.uid });
    });
  }

  return (
    <ScrollView keyboardAware>
      <Container>
        <ErrorOrLoadingDialog
          loading={loading}
          error={error}
          onDismiss={() => setPromise(undefined)}
        />

        <View>
          <Select
            visible={selectOpen}
            onDismiss={() => setSelectOpen(false)}
            options={options ?? []}
            titleAccossor={(col) => col.meta.name!}
            onChange={(chosen) => {
              setSelectOpen(false);
              if (!chosen || chosen === collection) {
                return;
              }
              setCollection(chosen);
            }}
            anchor={(
              <TouchableRipple
                onPress={() => setSelectOpen(true)}
              >
                <TextInputWithIcon
                  editable={false}
                  label="Move to Notebook"
                  accessibilityLabel="Move to Notebook"
                  value={collection?.meta.name ?? "No Notebooks"}
                  icon="plus"
                  iconAccessibilityLabel="Create Notebook"
                  iconOnPress={() => navigation.navigate("CollectionCreate")}
                />
              </TouchableRipple>
            )}
          />
          <HelperText
            type="error"
            visible={!!errors?.notebook}
          >
            {errors?.notebook}
          </HelperText>
        </View>

        <Button
          mode="contained"
          disabled={loading}
          onPress={onMove}
        >
          <Text>{loading ? "Loading…" : "Move"}</Text>
        </Button>
      </Container>
    </ScrollView>
  );
}
