// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { StatusBar } from "react-native";
import { DarkTheme, DefaultTheme, Provider as PaperProvider, Colors } from "react-native-paper";

import { AppearanceProvider, useColorScheme } from "react-native-appearance";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import RootNavigator from "./RootNavigator";

import ErrorBoundary from "./ErrorBoundary";
import Drawer from "./Drawer";
import SettingsGate from "./SettingsGate";

import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens();

const DrawerNavigation = createDrawerNavigator();

function InnerApp() {
  // XXX Workaround for react-navigation #7561 (flashing drawer)
  const [initRender, setInitRender] = React.useState(true);
  React.useEffect(() => setInitRender(false), []);
  const colorScheme = useColorScheme();

  const baseTheme = (colorScheme === "dark") ? DarkTheme : DefaultTheme;

  const theme: typeof DefaultTheme = {
    ...baseTheme,
    mode: "exact",
    colors: {
      ...baseTheme.colors,
      primary: Colors.amber500,
      accent: Colors.lightBlueA700, // Not the real etesync theme but better for accessibility
    },
  };

  return (
    <PaperProvider theme={theme}>
      <ErrorBoundary>
        <SettingsGate>
          <NavigationContainer>
            <DrawerNavigation.Navigator
              drawerContent={({ navigation }) => <Drawer navigation={navigation} />}
              drawerStyle={initRender ? { width: 0 } : null}
            >
              <DrawerNavigation.Screen name="Root" component={RootNavigator} />
            </DrawerNavigation.Navigator>
          </NavigationContainer>
        </SettingsGate>
      </ErrorBoundary>
    </PaperProvider>
  );
}

class App extends React.Component {
  public render() {
    return (
      <AppearanceProvider>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <InnerApp />
      </AppearanceProvider>
    );
  }
}

export default App;
