// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View } from "react-native";
import { Button, useTheme, Text, HelperText } from "react-native-paper";
import { useSelector } from "react-redux";

import { StoreState, CachedCollection } from "../store";

import ConfirmationDialog from "../widgets/ConfirmationDialog";
import Select from "../widgets/Select";
import TextInput from "../widgets/TextInput";


interface FormErrors {
  name?: string;
  notebook?: string;
}


function titleAccessor(item: CachedCollection) {
  return item.meta.name;
}

interface PropsType {
  visible: boolean;
  onOk: (colUid: string, name: string) => void;
  onDismiss: () => void;
}

export default function ItemNewDialog(props: PropsType) {
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>();
  const cacheCollections = useSelector((state: StoreState) => state.cache.collections);
  const options = Array.from(cacheCollections.map((val, uid) => ({ ...val, uid })).values());
  const [collection, setCollection] = React.useState<typeof options[0] | undefined>(options[0]);
  const theme = useTheme();

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
      title="New note"
      visible={props.visible}
      onOk={onOk}
      onCancel={props.onDismiss}
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
        <Text>Notebook:</Text>
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
            <Button mode="contained" color={theme.colors.accent} onPress={() => setSelectOpen(true)}>{collection?.meta.name ?? noneString}</Button>
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
