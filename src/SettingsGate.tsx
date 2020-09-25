// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

import moment from "moment";
import "moment/locale/en-gb";

import { StoreState, store } from "./store";
import { setConnectionInfo } from "./store/actions";
import { logger, setLogLevel } from "./logging";

function handleConnectivityChange(connectionInfo: NetInfoState) {
  logger.info(`ConnectionfInfo: ${connectionInfo.isConnected} ${connectionInfo.type}`);
  store.dispatch(setConnectionInfo({ type: connectionInfo.type, isConnected: connectionInfo.isConnected }));
}

export default React.memo(function SettingsGate(props: React.PropsWithChildren<{}>) {
  const settings = useSelector((state: StoreState) => state.settings);

  React.useEffect(() => {
    setLogLevel(settings.logLevel);
  }, [settings.logLevel]);

  React.useEffect(() => {
    moment.locale(settings.locale);
  }, [settings.locale]);

  // Not really settings but the app's general state.
  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return unsubscribe;
  }, []);

  return (
    <>{props.children}</>
  );
});
