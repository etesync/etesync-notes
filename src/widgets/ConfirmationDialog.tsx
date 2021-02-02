// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Keyboard, Platform, ScrollView } from "react-native";
import { Card, Portal, Modal, Button, ProgressBar, Paragraph, Dialog } from "react-native-paper";

import { isPromise, useDeviceBreakpoint, useIsMounted } from "../helpers";
import { useTheme } from "../theme";

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
  // XXX: Hack to allow editing in dialogs
  isEditingHack?: boolean;
}

export default React.memo(function ConfirmationDialog(props: PropsType) {
  const isMounted = useIsMounted();
  const [loading, setLoading] = React.useState(props.loading ?? false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const theme = useTheme();
  const labelCancel = props.labelCancel ?? "Cancel";
  const labelOk = props.labelOk ?? "OK";
  const loadingText = props.loadingText ?? "Loading...";
  const buttonThemeOverride = { colors: { primary: theme.colors.accentText } };
  const breakpoint = useDeviceBreakpoint("tabletLandscape");

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

  const FakePortal = (props.isEditingHack) ? React.Fragment : Portal;

  if (Platform.OS === "web") {
    return (
      <FakePortal>
        <Dialog
          visible={props.visible}
          onDismiss={props.onCancel}
          dismissable={!loading && props.dismissable}
          style={{ maxHeight: "100%", alignSelf: "center", width: breakpoint ? 560 : 280, maxWidth: "100%" }}
        >
          <ScrollView>
            <Dialog.Title>
              {props.title}
            </Dialog.Title>
            <Dialog.Content>
              {content}
            </Dialog.Content>
            <Dialog.Actions>
              {buttons}
            </Dialog.Actions>
          </ScrollView>
        </Dialog>
      </FakePortal>
    );
  }

  return (
    <FakePortal>
      <Modal
        visible={props.visible}
        onDismiss={props.onCancel}
        dismissable={!loading && props.dismissable}
        style={{ alignItems: "center" }}
        contentContainerStyle={{ maxHeight: "100%", width: breakpoint ? 560 : 280, maxWidth: "100%" }}
      >
        <ScrollView>
          <Card accessible={false}>
            <Card.Title title={props.title} />
            <Card.Content>
              {content}
            </Card.Content>
            <Card.Actions style={{ justifyContent: "flex-end" }}>
              {buttons}
            </Card.Actions>
          </Card>
        </ScrollView>
      </Modal>
    </FakePortal>
  );
});
