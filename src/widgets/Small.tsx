// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import { Text } from "react-native";

export default React.memo(function Small(props: React.PropsWithChildren<{}>) {
  return (
    <Text style={{ fontSize: 10 }}>{props.children}</Text>
  );
});
