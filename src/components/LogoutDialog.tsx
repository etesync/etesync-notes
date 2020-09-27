// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Paragraph } from "react-native-paper";

import { persistor } from "../store";
import { logout } from "../store/actions";

import ConfirmationDialog from "../widgets/ConfirmationDialog";

import { useCredentials } from "../credentials";
import { useDispatch } from "react-redux";

export default function LogoutDialog(props: { visible: boolean, onDismiss: (loggedOut: boolean) => void }) {
  const dispatch = useDispatch();
  const etebase = useCredentials()!;

  return (
    <ConfirmationDialog
      key={props.visible.toString()}
      title="Are you sure?"
      visible={props.visible}
      onOk={async () => {
        // Here we log out regardless if we actually have an etesync
        dispatch(logout(etebase));

        persistor.persist();

        props.onDismiss(true);
      }}
      onCancel={() => props.onDismiss(false)}
    >
      <Paragraph>
        Are you sure you would like to log out?
        Logging out will remove your account and all of its data from your device, and unsynced changes WILL be lost.
      </Paragraph>
    </ConfirmationDialog>
  );
}
