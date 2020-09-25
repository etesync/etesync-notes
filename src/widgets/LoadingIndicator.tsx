// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

import Container from "./Container";
export default function LoadingIndicator(_props: any) {
  const { style, status, notice, ...props } = _props;
  return (
    <Container style={{ flexGrow: 1 }}>
      <View style={{ flexGrow: 1, justifyContent: "center" }}>
        <ActivityIndicator animating size="large" style={[style]} {...props} />
        {status && <Text style={{ textAlign: "center", marginTop: 30 }}>{status}</Text>}
      </View>
      {notice && <Text>{notice}</Text>}
    </Container>
  );
}
