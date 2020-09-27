// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import SafeAreaView from "react-native-safe-area-view";
import { View } from "react-native";
import { Appbar, Paragraph, useTheme } from "react-native-paper";

import { Title } from "./widgets/Typography";
import LoginScreen from "./screens/LoginScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import DebugLogsScreen from "./screens/DebugLogsScreen";
import NoteListScreen from "./screens/NoteListScreen";
import CollectionEditScreen from "./screens/CollectionEditScreen";
import ItemEditScreen from "./screens/ItemEditScreen";

import Wizard, { WizardNavigationBar, PagePropsType } from "./widgets/Wizard";

import { useCredentials } from "./credentials";
import { StoreState } from "./store";
import { setSettings } from "./store/actions";

import { isDefined } from "./helpers";

import * as C from "./constants";

const Stack = createStackNavigator();

const wizardPages = [
  (props: PagePropsType) => (
    <>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Title style={{ textAlign: "center" }}>Welcome to EteSync Notes!</Title>
        <Paragraph style={{ textAlign: "center" }}>
          Please follow these few quick steps to get started.
        </Paragraph>
      </View>
      <WizardNavigationBar {...props} />
    </>
  ),
].filter(isDefined);

const MenuButton = React.memo(function MenuButton() {
  const navigation = useNavigation() as DrawerNavigationProp<any>;
  return (
    <Appbar.Action icon="menu" accessibilityLabel="Main menu" onPress={() => navigation.openDrawer()} />
  );
});

export default React.memo(function RootNavigator() {
  const settings = useSelector((state: StoreState) => state.settings);
  const dispatch = useDispatch();
  const etebase = useCredentials();
  const theme = useTheme();

  if (!settings.ranWizrd) {
    return (
      <>
        <SafeAreaView />
        <Wizard pages={wizardPages} onFinish={() => dispatch(setSettings({ ranWizrd: true }))} style={{ flex: 1 }} />
      </>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#000000",
        headerBackTitleVisible: false,
        headerBackTitleStyle: {
          backgroundColor: "black",
        },
      }}
    >
      {(etebase === null) ? (
        <>
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{
              title: "Login",
              headerLeft: () => (
                <MenuButton />
              ),
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="home"
            component={NoteListScreen}
            options={{
              title: C.appName,
              headerLeft: () => (
                <MenuButton />
              ),
            }}
          />
          <Stack.Screen
            name="CollectionEdit"
            component={CollectionEditScreen}
          />
          <Stack.Screen
            name="ItemEdit"
            component={ItemEditScreen}
          />
        </>
      )}
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen
        name="DebugLogs"
        component={DebugLogsScreen}
        options={{
          title: "View Debug Logs",
        }}
      />
    </Stack.Navigator>
  );
});
