// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import ErrorDialog from "./ErrorDialog";
import ConfirmationDialog from "./ConfirmationDialog";

interface PropsType {
  loading?: boolean;
  error?: Error;
  onDismiss: () => void;
  loadingText?: string;
}

export default React.memo(function ErrorOrLoadingDialog(props: PropsType) {
  if (props.error) {
    return (
      <ErrorDialog
        error={props.error.toString()}
        onOk={props.onDismiss}
      />
    );
  } else if (props.loading) {
    return (
      <ConfirmationDialog
        title="Loading"
        visible={props.loading}
        onCancel={props.onDismiss}
        loading
        loadingText={props.loadingText ?? "Please wait..."}
      >
        <React.Fragment />
      </ConfirmationDialog>
    );
  }

  return null;
});
