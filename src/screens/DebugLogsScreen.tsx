// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { View, Clipboard } from "react-native";
import { Button, Text } from "react-native-paper";

import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import { getLogs, clearLogs } from "../logging";

export default function DebugLogsScreen() {
  const [logs, setLogs] = React.useState<string>();

  React.useEffect(() => {
    getLogs().then((value) => setLogs(value.join("\n")));
  }, []);

  return (
    <ScrollView style={{ flex: 1 }}>
      <Container>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginBottom: 15 }}>
          <Button mode="contained" onPress={() => clearLogs().then(() => setLogs(undefined))}>Clear logs</Button>
          <Button mode="contained" disabled={!logs} onPress={() => Clipboard.setString(logs!)}>Copy</Button>
        </View>

        <Text>
          {(logs) ? logs : "No logs found"}
        </Text>
      </Container>
    </ScrollView>
  );
}
