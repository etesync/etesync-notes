// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { StatusBar } from "react-native";
import { DarkTheme, DefaultTheme, Provider as PaperProvider, Colors } from "react-native-paper";

import { AppearanceProvider, useColorScheme } from "react-native-appearance";

import { NavigationContainer, PathConfig } from "@react-navigation/native";
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
import { MainStackParamList, RootStackParamList } from "./StacksParamList";
enableScreens();

const DrawerNavigation = createDrawerNavigator();

type StackScreens<T extends RootStackParamList | MainStackParamList> = {
  [route in keyof T]: string | PathConfig;
};

const mainStackScreens: StackScreens<MainStackParamList> = {
  Home: "notes/:colUid?",
  CollectionCreate: "notes/new-notebook",
  CollectionEdit: "notes/:colUid/edit",
  CollectionChangelog: "notes/:colUid/manage",
  CollectionMembers: "notes/:colUid/members",
  NoteCreate: "notes/new-note",
  NoteProps: "notes/:colUid/:itemUid/properties",
  NoteEdit: "notes/:colUid/:itemUid",
  Invitations: "invitations",
};

const rootStackScreens: StackScreens<RootStackParamList> = {
  Main: {
    path: "",
    screens: mainStackScreens,
  },
  Login: "login",
  Signup: "signup",
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
