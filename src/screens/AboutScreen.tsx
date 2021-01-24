// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Linking, FlatList } from "react-native";
import { Text, List, TouchableRipple } from "react-native-paper";

import { Title } from "../widgets/Typography";
import Container from "../widgets/Container";

import { expo } from "../../app.json";
import * as C from "../constants";
import { useTheme } from "../theme";

import * as licenses from "../../licenses.json";

function generateRenderLicenseItem(pkgLicenses: any) {
  return function renderLicense(param: { item: string }) {
    const pkgName = param.item;
    const pkg = pkgLicenses[pkgName]!;
    const { publisher, repository, url } = pkg;
    const description = (publisher && (publisher.toLowerCase() !== pkgName.toLowerCase())) ? `${pkg.licenses} by ${publisher}` : pkg.licenses;
    const link = repository ?? url;
    return (
      <List.Item
        key={pkgName}
        title={pkgName}
        description={description}
        right={(props) => (<List.Icon {...props} icon="chevron-right" />)}
        onPress={link && (() => { Linking.openURL(link) })}
      />
    );
  };
}

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.surface }}
      ListHeaderComponent={() => (
        <Container>
          <Title style={{ textAlign: "center" }}>{C.appName} {expo.version}</Title>
          <TouchableRipple onPress={() => { Linking.openURL(C.homePage) }}>
            <Text style={{ textAlign: "center", color: theme.colors.accentText, textDecorationLine: "underline", margin: 10 }}>{C.homePage}</Text>
          </TouchableRipple>
          <Title style={{ marginTop: 30 }}>Open Source Licenses</Title>
        </Container>
      )}
      data={Object.keys(licenses.dependencies)}
      keyExtractor={(item) => item}
      renderItem={generateRenderLicenseItem(licenses.dependencies)}
    />
  );
}
