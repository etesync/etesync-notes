// SPDX-FileCopyrightText: © 2017 EteSync Authors
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { View } from "react-native";
import { Button, Paragraph, Headline } from "react-native-paper";

import LoadingIndicator from "../widgets/LoadingIndicator";
import Container from "../widgets/Container";
import Wizard, { WizardNavigationBar, PagePropsType } from "../widgets/Wizard";

import { SyncManager } from "../sync/SyncManager";

import { store } from "../store";
import { useCredentials } from "../credentials";
import { useNavigation } from "@react-navigation/native";
import { useSyncGate } from "../SyncGate";
import { useDispatch } from "react-redux";
import { performSync } from "../store/actions";

import * as C from "../constants";

const wizardPages = [
  (props: PagePropsType) => (
    <SetupCollectionsPage {...props} />
  ),
];

function SetupCollectionsPage(props: PagePropsType) {
  const etebase = useCredentials()!;
  const [error, setError] = React.useState<Error>();
  const [loading, setLoading] = React.useState(false);
  async function onNext() {
    setLoading(true);
    try {
      const colMgr = etebase.getCollectionManager();
      const types = [
        [C.colType, "My Notes"],
      ];
      for (const [type, name] of types) {
        const meta: Etebase.ItemMetadata = {
          name,
          mtime: (new Date()).getTime(),
        };
        const collection = await colMgr.create(type, meta, "");
        await colMgr.upload(collection);
      }

      const syncManager = SyncManager.getManager(etebase!);
      syncManager.sync();

      props.next?.();
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  const next = (loading) ? undefined : onNext;
  if (loading) {
    return (
      <LoadingIndicator />
    );
  }

  return (
    <>
      <View style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Headline style={{ textAlign: "center" }}>Setup Notebook</Headline>
        <Paragraph style={{ textAlign: "center" }}>
          In order to use {C.appName} you need a notebook to store your data.
          Clicking "Finish" below will create a default notebook for you.
        </Paragraph>
        {(error) && (
          <Paragraph style={{ color: "red" }}>{error.message}</Paragraph>
        )}
      </View>
      <WizardNavigationBar {...props} next={next} />
    </>
  );
}

export default function AccountWizardScreen() {
  const [tryCount, setTryCount] = React.useState(0);
  const [ranWizard, setRanWizard] = React.useState(false);
  const [syncError, setSyncError] = React.useState<Error>();
  const etebase = useCredentials();
  const dispatch = useDispatch();
  const syncGate = useSyncGate();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setSyncError(undefined);
    if (!etebase) {
      return;
    }
    setLoading(true);
    dispatch(performSync((async () => {
      const syncManager = SyncManager.getManager(etebase!);
      const sync = syncManager.sync(true);
      try {
        await sync;

        const cachedCollection = store.getState().cache.collections;
        // XXX new account - though should change test to see if there are any PIM types
        if (cachedCollection.size > 0) {
          setRanWizard(true);
        }
      } catch (e) {
        setSyncError(e);
      }
      setLoading(false);

      return true;
    })()));
  }, [etebase, tryCount]);

  React.useEffect(() => {
    if (etebase === null) {
      navigation.navigate("LoginScreen");
    }
  }, [etebase]);

  React.useEffect(() => {
    if (!syncError && !syncGate && ranWizard) {
      navigation.navigate("home", undefined);
    }
  }, [ranWizard, syncError, syncGate]);

  if (syncError) {
    return (
      <Container style={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
        <Headline style={{ textAlign: "center" }}>Error!</Headline>
        <Paragraph style={{ textAlign: "center" }}>
          {syncError?.message}
        </Paragraph>
        <Button
          mode="contained"
          onPress={() => setTryCount(tryCount + 1)}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (syncGate) {
    return syncGate;
  }

  if (loading) {
    return (<LoadingIndicator />);
  }

  if (!ranWizard) {
    return (
      <Wizard pages={wizardPages} onFinish={() => setRanWizard(true)} style={{ display: "flex", flexDirection: "column", flex: 1 }} />
    );
  }

  return (<LoadingIndicator />);
}
