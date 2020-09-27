// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Paragraph, Button, useTheme } from "react-native-paper";

import { persistor } from "../store";
import { logout } from "../store/actions";

import ConfirmationDialog from "../widgets/ConfirmationDialog";
import Select from "../widgets/Select";

import { useCredentials } from "../credentials";
import { useDispatch } from "react-redux";

interface PropsType {
  visible: boolean;
  onOk: () => void;
  onDismiss: () => void;
}

export default function ItemNewDialog(props: PropsType) {
  const [selectOpen, setSelectOpen] = React.useState(false);
  const [collection, setCollection] = React.useState<Etebase.Collection>();
  const dispatch = useDispatch();
  const theme = useTheme();
  const etebase = useCredentials()!;

  return (
    <ConfirmationDialog
      key={props.visible.toString()}
      title="New note"
      visible={props.visible}
      onOk={props.onOk}
      onCancel={props.onDismiss}
    >
      <Select
        visible={selectSourceOpen}
        noneString="No notebooks"
        onDismiss={() => setSelectOpen(false)}
        options={options ?? []}
        titleAccossor={titleAccessor}
        onChange={(chosen) => {
          setSelectOpen(false);
          if (chosen === collection) {
            return;
          }
          setCollection(chosen);
        }}
        anchor={(
          <Button mode="contained" color={theme.colors.accent} onPress={() => setSelectOpen(true)}>{collection}</Button>
        )}
      />
      <Paragraph>
      </Paragraph>
    </ConfirmationDialog>
  );
}
