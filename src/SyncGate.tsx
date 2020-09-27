// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";

import { useCredentials } from "./credentials";

import LoadingIndicator from "./widgets/LoadingIndicator";

import { StoreState } from "./store";

export function useSyncGate() {
  const etebase = useCredentials();
  const syncCount = useSelector((state: StoreState) => state.syncCount);
  const syncStatus = useSelector((state: StoreState) => state.syncStatus);

  if ((syncCount > 0) || !etebase) {
    return (<LoadingIndicator status={syncStatus} notice="* Please keep the app open while syncing" />);
  }

  return null;
}
