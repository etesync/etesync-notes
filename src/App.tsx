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

import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { useSelector } from "react-redux";
import { StoreState } from "./store";
import { RootStackParamList } from "./RootStackParamList";
enableScreens();

const DrawerNavigation = createDrawerNavigator();

type RootStackScreens = {
  [route in keyof RootStackParamList]: string;
};

const rootStackScreens: RootStackScreens = {
  Home: "",
  Login: "login",
  Signup: "signup",
  CollectionCreate: "new-notebook",
  Collection: "notebook/:colUid",
  CollectionEdit: "notebook/:colUid/edit",
  CollectionChangelog: "notebook/:colUid/manage",
  CollectionMembers: "notebook/:colUid/members",
  NoteCreate: "new-note",
  NoteEdit: "notebook/:colUid/note/:itemUid",
  NoteProps: "notebook/:colUid/note/:itemUid/properties",
  NoteMove: "notebook/:colUid/note/:itemUid/move",
  Invitations: "invitations",
  Settings: "settings",
  About: "settings/about",
  DebugLogs: "settings/logs",
  AccountWizard: "account-wizard",
  "404": "*",
};

const linking = {
  prefixes: ["https://notes.etesync.com", "com.etesync.notes://"],
  config: {
    screens: {
      Root: {
        path: "",
        screens: rootStackScreens,
      },
    },
  },
};

function InnerApp() {
  // XXX Workaround for react-navigation #7561 (flashing drawer)
  const [initRender, setInitRender] = React.useState(true);
  React.useEffect(() => setInitRender(false), []);
  const colorScheme_ = useColorScheme();
  const darkModePreference = useSelector((state: StoreState) => state.settings.theme);
  const colorScheme = (darkModePreference === "auto") ? colorScheme_ : darkModePreference;
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
          <NavigationContainer linking={linking}>
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
      <SafeAreaProvider>
        <AppearanceProvider>
          <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
          <InnerApp />
        </AppearanceProvider>
      </SafeAreaProvider>
    );
  }
}

export default App;
