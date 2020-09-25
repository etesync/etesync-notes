// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Paragraph } from "react-native-paper";

import ConfirmationDialog from "./ConfirmationDialog";

interface PropsType {
  title?: string;
  error?: string;
  onOk?: () => void | Promise<any>;
  labelOk?: string;
  loadingText?: string;
}

export default React.memo(function ErrorDialog(props: PropsType) {
  return (
    <ConfirmationDialog
      title={props.title ?? "Error"}
      visible={!!props.error}
      onCancel={props.onOk}
      labelCancel={props.labelOk ?? "Ok"}
      labelOk={props.labelOk}
      loadingText={props.loadingText}
    >
      <Paragraph>
        {props.error}
      </Paragraph>
    </ConfirmationDialog>
  );
});
