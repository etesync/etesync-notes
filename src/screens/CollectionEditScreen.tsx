// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";
import { TextInput as NativeTextInput } from "react-native";
import { Text, HelperText, Button, Appbar, Paragraph } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";

import { SyncManager } from "../sync/SyncManager";
import { useSyncGate } from "../SyncGate";
import { useCredentials } from "../credentials";
import { StoreState, useAsyncDispatch } from "../store";
import { collectionUpload, performSync, pushMessage } from "../store/actions";

import TextInput from "../widgets/TextInput";
import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import ConfirmationDialog from "../widgets/ConfirmationDialog";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";

import { useLoading, defaultColor } from "../helpers";

import ColorPicker from "../widgets/ColorPicker";
import * as C from "../constants";

interface FormErrors {
  name?: string;
  color?: string;
}

type RootStackParamList = {
  CollectionEditScreen: {
    colUid?: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "CollectionEditScreen">;
}

export default function CollectionEditScreen(props: PropsType) {
  const [errors, setErrors] = React.useState({} as FormErrors);
  const [name, setName] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [color, setColor] = React.useState<string>("");
  const dispatch = useAsyncDispatch();
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const syncGate = useSyncGate();
  const navigation = useNavigation();
  const etebase = useCredentials()!;
  const [loading, error, setPromise] = useLoading();
  const colType = C.colType;

  const colUid: string = props.route.params.colUid ?? "";
  React.useEffect(() => {
    if (syncGate) {
      return;
    }

    const passedCollection = cacheCollections.get(colUid);
    if (passedCollection) {
      const { meta } = passedCollection;
      setName(meta.name);
      setDescription(meta.description ?? "");
      if (meta.color !== undefined) {
        setColor(meta.color);
      }
    }

  }, [syncGate, colUid]);

  React.useEffect(() => {
    navigation.setOptions({
      title: (colUid) ? "Edit Notebook" : "New Notebook",
      headerRight: () => (
        <RightAction colUid={colUid} />
      ),
    });
  }, [colUid]);

  if (syncGate) {
    return syncGate;
  }

  function onSave() {
    setPromise(async () => {
      const saveErrors: FormErrors = {};
      const fieldRequired = "This field is required!";

      if (!name) {
        saveErrors.name = fieldRequired;
      }

      if (color && !/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(color)) {
        saveErrors.color = "Must be of the form #RRGGBB or #RRGGBBAA or empty";
      }

      if (Object.keys(saveErrors).length > 0) {
        setErrors(saveErrors);
        return;
      }

      const colMgr = etebase.getCollectionManager();
      const mtime = (new Date()).getTime();
      const meta = { type: colType, name, description, color, mtime };
      let collection;
      if (colUid) {
        collection = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
        const colMeta = await collection.getMeta();
        await collection.setMeta({ ...colMeta, ...meta });
      } else {
        collection = await colMgr.create(meta, "");
      }

      await dispatch(collectionUpload(colMgr, collection));
      dispatch(pushMessage({ message: "Collection saved", severity: "success" }));
      navigation.goBack();
      // FIXME having the sync manager here is ugly. We should just deal with these changes centrally.
      const syncManager = SyncManager.getManager(etebase);
      dispatch(performSync(syncManager.sync())); // not awaiting on puprose
    });
  }

  const descriptionRef = React.createRef<NativeTextInput>();

  const collectionColorBox = (
    <>
      <ColorPicker
        error={errors.color}
        defaultColor={defaultColor}
        color={color}
        onChange={setColor}
      />
    </>
  );

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
          onSubmitEditing={() => descriptionRef.current!.focus()}
          error={!!errors.name}
          onChangeText={setName}
          label="Display name (title)"
          accessibilityLabel="Display name (title)"
          value={name}
        />
        <HelperText
          type="error"
          visible={!!errors.name}
        >
          {errors.name}
        </HelperText>

        <TextInput
          ref={descriptionRef}
          onChangeText={setDescription}
          label="Description (optional)"
          accessibilityLabel="Description (optional)"
          value={description}
        />
        <HelperText
          type="error"
          visible={false}
        >
          <React.Fragment />
        </HelperText>

        {collectionColorBox}

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

function RightAction(props: { colUid: string }) {
  const [confirmationVisible, setConfirmationVisible] = React.useState(false);
  const navigation = useNavigation();
  const etebase = useCredentials()!;
  const dispatch = useAsyncDispatch();
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);

  const colUid = props.colUid;
  if (!colUid) {
    return <React.Fragment />;
  }

  return (
    <React.Fragment>
      <Appbar.Action
        icon="delete"
        accessibilityLabel="Delete collection"
        onPress={() => {
          setConfirmationVisible(true);
        }}
      />
      <ConfirmationDialog
        title="Are you sure?"
        visible={confirmationVisible}
        onOk={async () => {
          const colMgr = etebase.getCollectionManager();
          const collection = colMgr.cacheLoad(cacheCollections.get(colUid)!.cache);
          const mtime = (new Date()).getTime();
          const meta = await collection.getMeta();
          await collection.setMeta({ ...meta, mtime });
          await collection.delete();
          await colMgr.upload(collection);
          dispatch(pushMessage({ message: "Collection deleted", severity: "success" }));
          navigation.navigate("home");
          // FIXME having the sync manager here is ugly. We should just deal with these changes centrally.
          const syncManager = SyncManager.getManager(etebase);
          dispatch(performSync(syncManager.sync())); // not awaiting on puprose
        }}
        onCancel={() => {
          setConfirmationVisible(false);
        }}
      >
        <Paragraph>This colection and all of its data will be removed from the server.</Paragraph>
      </ConfirmationDialog>
    </React.Fragment>
  );
}
