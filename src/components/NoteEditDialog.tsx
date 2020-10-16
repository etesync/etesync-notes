// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View } from "react-native";
import { HelperText, TouchableRipple } from "react-native-paper";
import { useSelector } from "react-redux";

import { StoreState, CachedCollection, CachedItem } from "../store";

import ConfirmationDialog from "../widgets/ConfirmationDialog";
import Select from "../widgets/Select";
import TextInput from "../widgets/TextInput";


interface FormErrors {
  name?: string;
  notebook?: string;
}


function titleAccessor(col: CachedCollection) {
  return col.meta.name!;
}

interface PropsType {
  visible: boolean;
  onOk: (colUid: string, name: string) => void;
  onDismiss: () => void;
  initialColUid?: string;
  colUid?: string;
  item?: CachedItem;
}

export default function NoteEditDialog(props: PropsType) {
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [name, setName] = React.useState(props.item?.meta.name ?? "");
  const [errors, setErrors] = React.useState<FormErrors>();
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const options = Array.from(cacheCollections.map((val, uid) => ({ ...val, uid })).values());
  const initialColUid = props.colUid ?? props.initialColUid;
  const [collection, setCollection] = React.useState<typeof options[0] | undefined>(
    options.find((x) => x.uid === initialColUid) ?? options[0]
  );

  const noneString = "No Notebooks";

  function onOk() {
    const errors: FormErrors = {};
    const fieldRequired = "This field is required!";
    if (!name) {
      errors.name = fieldRequired;
    }
    if (!collection) {
      errors.notebook = fieldRequired;
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    props.onOk(collection!.uid, name);
  }

  return (
    <ConfirmationDialog
      key={props.visible.toString()}
      title={(props.item) ? "Edit note" : "New note"}
      visible={props.visible}
      onOk={onOk}
      onCancel={props.onDismiss}
      isEditingHack
    >
      <TextInput
        autoFocus
        onChangeText={setName}
        label="Name"
        accessibilityLabel="Name"
        placeholder="My grocery list"
        value={name}
      />
      <HelperText
        type="error"
        visible={!!errors?.name}
      >
        {errors?.name}
      </HelperText>

      <View>
        <Select
          visible={selectOpen}
          onDismiss={() => setSelectOpen(false)}
          options={options ?? []}
          titleAccossor={titleAccessor}
          onChange={(chosen) => {
            setSelectOpen(false);
            if (chosen === collection) {
              return;
            }
            setCollection(chosen ?? undefined);
          }}
          anchor={(
            <TouchableRipple
              onPress={() => setSelectOpen(true)}
              disabled={!!props.colUid}
            >
              <TextInput
                editable={false}
                label="Notebook"
                accessibilityLabel="Notebook"
                value={collection?.meta.name ?? noneString}
                disabled={!!props.colUid}
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
    </ConfirmationDialog>
  );
}
