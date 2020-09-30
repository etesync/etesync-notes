// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Keyboard, Platform } from "react-native";
import { Card, Portal, Modal, Button, ProgressBar, Paragraph, useTheme, Dialog } from "react-native-paper";

import { isPromise, useIsMounted } from "../helpers";

interface PropsType {
  title: string;
  children: React.ReactNode | React.ReactNode[];
  visible: boolean;
  dismissable?: boolean;
  onCancel?: () => void;
  onOk?: () => void | Promise<any>;
  labelCancel?: string;
  labelOk?: string;
  loading?: boolean;
  loadingText?: string;
}

export default React.memo(function ConfirmationDialog(props: PropsType) {
  const isMounted = useIsMounted();
  const [loading, setLoading] = React.useState(props.loading ?? false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const theme = useTheme();
  const labelCancel = props.labelCancel ?? "Cancel";
  const labelOk = props.labelOk ?? "OK";
  const loadingText = props.loadingText ?? "Loading...";
  const buttonThemeOverride = { colors: { primary: theme.colors.accent } };

  React.useEffect(() => {
    Keyboard.dismiss();
  }, [props.visible]);

  function onOk() {
    const ret = props.onOk?.();
    if (isPromise(ret)) {
      // If it's a promise, we update the loading state based on it.
      setLoading(true);
      ret.catch((e) => {
        if (isMounted.current) {
          setError(e.toString());
        }
      }).finally(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      });
    }
  }

  let content: React.ReactNode | React.ReactNode[];
  if (error !== undefined) {
    content = (
      <Paragraph>Error: {error.toString()}</Paragraph>
    );
  } else if (loading) {
    content = (
      <>
        <Paragraph>{loadingText}</Paragraph>
        <ProgressBar indeterminate />
      </>
    );
  } else {
    content = props.children;
  }

  const buttons = (
    <>
      {props.onCancel &&
        <Button disabled={loading} theme={buttonThemeOverride} onPress={props.onCancel}>{labelCancel}</Button>
      }
      {!error && props.onOk &&
        <Button disabled={loading} theme={buttonThemeOverride} onPress={onOk}>{labelOk}</Button>
      }
    </>
  );

  if (Platform.OS === "web") {
    return (
      <Portal>
        <Dialog
          visible={props.visible}
          onDismiss={props.onCancel}
          dismissable={props.dismissable && !loading}
        >
          <Dialog.Title>
            {props.title}
          </Dialog.Title>
          <Dialog.Content>
            {content}
          </Dialog.Content>
          <Dialog.Actions>
            {buttons}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal
        visible={props.visible}
        onDismiss={props.onCancel}
        dismissable={props.dismissable && !loading}
      >
        <Card accessible={false}>
          <Card.Title title={props.title} />
          <Card.Content>
            {content}
          </Card.Content>
          <Card.Actions style={{ justifyContent: "flex-end" }}>
            {buttons}
          </Card.Actions>
        </Card>
      </Modal>
    </Portal>
  );
});
