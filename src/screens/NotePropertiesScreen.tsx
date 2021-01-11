// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { Text, HelperText, Button, TouchableRipple } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Item } from "etebase";

import { useSyncGate } from "../SyncGate";
import { useCredentials } from "../credentials";
import { StoreState, useAsyncDispatch } from "../store";
import { itemBatch, pushMessage } from "../store/actions";
import { CachedItem } from "../store/reducers";

import TextInput from "../widgets/TextInput";
import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";
import Select from "../widgets/Select";
import TextInputWithIcon from "../widgets/TextInputWithIcon";
import NotFound from "../widgets/NotFound";

import { useLoading, NoteMetadata } from "../helpers";
import { RootStackParamList } from "../RootStackParamList";

interface FormErrors {
  name?: string;
  notebook?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, "NoteProps"> | StackNavigationProp<RootStackParamList, "NoteCreate">;

interface PropsType {
  route: RouteProp<RootStackParamList, "NoteProps"> | RouteProp<RootStackParamList, "NoteCreate">;
}

export default function NotePropertiesScreen(props: PropsType) {
  const colUid = props.route.params?.colUid;
  const itemUid = props.route.params?.itemUid;
  const [errors, setErrors] = React.useState({} as FormErrors);
  const [name, setName] = React.useState<string>("");
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
  const [collection, setCollection] = React.useState<typeof options[0] | undefined>();
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
            const { meta } = cachedItem;
            setName(meta.name!);
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
      title: (colUid && itemUid) ? "Edit Note Properties" : "New Note",
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

  function onSave() {
    setPromise(async () => {
      const saveErrors: FormErrors = {};
      const fieldRequired = "This field is required!";

      if (!name) {
        saveErrors.name = fieldRequired;
      }

      if (!collection) {
        saveErrors.notebook = fieldRequired;
      }

      if (Object.keys(saveErrors).length > 0) {
        setErrors(saveErrors);
        return;
      }

      const colMgr = etebase.getCollectionManager();
      const col = colMgr.cacheLoad(collection!.cache);
      const itemMgr = colMgr.getItemManager(col);
      
      let item: Item;
      if (cachedItem) {
        item = itemMgr.cacheLoad(cachedItem.cache);
        const meta = item.getMeta();
        meta.name = name;
        meta.mtime = (new Date()).getTime();
        item.setMeta(meta);
      } else {
        const meta: NoteMetadata = {
          name,
          mtime: (new Date()).getTime(),
        };
        item = await itemMgr.create(meta, "");
      }

      await dispatch(itemBatch(col, itemMgr, [item]));
      if (cachedItem) {
        dispatch(pushMessage({ message: "Note properties saved", severity: "success" }));
        navigation.goBack();
      } else {
        dispatch(pushMessage({ message: "Note created", severity: "success" }));
        navigation.replace("NoteEdit", { colUid: collection!.uid, itemUid: item.uid });
      }
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
        <TextInput
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => setSelectOpen(true)}
          error={!!errors.name}
          onChangeText={setName}
          label="Name"
          accessibilityLabel="Name"
          value={name}
        />
        <HelperText
          type="error"
          visible={!!errors.name}
        >
          {errors.name}
        </HelperText>

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
                disabled={!!itemUid}
              >
                <TextInputWithIcon
                  editable={false}
                  label="Notebook"
                  accessibilityLabel="Notebook"
                  value={collection?.meta.name ?? "No Notebooks"}
                  disabled={!!itemUid}
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
          onPress={onSave}
        >
          <Text>{loading ? "Loading…" : "Save"}</Text>
        </Button>
      </Container>
    </ScrollView>
  );
}
