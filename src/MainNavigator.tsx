// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Appbar, useTheme } from "react-native-paper";

import PlaceholderScreen from "./screens/PlaceholderScreen";
import NoteListScreen from "./screens/NoteListScreen";
import NoteEditScreen from "./screens/NoteEditScreen";
import NotePropertiesScreen from "./screens/NotePropertiesScreen";
import CollectionEditScreen from "./screens/CollectionEditScreen";
import CollectionChangelogScreen from "./screens/CollectionChangelogScreen";
import CollectionMembersScreen from "./screens/CollectionMembersScreen";
import InvitationsScreen from "./screens/InvitationsScreen";

import * as C from "./constants";
import { MainStackParamList } from "./StacksParamList";
import { useSplitView } from "./helpers";

const MainStack = createStackNavigator<MainStackParamList>();

const MenuButton = React.memo(function MenuButton() {
  const navigation = useNavigation() as DrawerNavigationProp<any>;
  return (
    <Appbar.Action icon="menu" accessibilityLabel="Main menu" onPress={() => navigation.openDrawer()} />
  );
});

export default function MainNavigator() {
  const splitView = useSplitView();
  const theme = useTheme();
  return (
    <View style={styles.container}>
      {splitView ? (
        <>
          <View style={styles.leftScreen}>
            <NoteListScreen
              route={{ params: { colUid: "" } }}
              fixed
            />
          </View>
          <View style={styles.separator} />
        </>
      ) : null}
      <MainStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: "#000000",
          headerBackTitleVisible: false,
          headerBackTitleStyle: {
            backgroundColor: "black",
          },
          cardStyle: styles.rightScreen,
        }}
      >
        <MainStack.Screen
          name="Home"
          component={splitView ? PlaceholderScreen : NoteListScreen}
          initialParams={{ colUid: "" }}
          options={splitView ? {
            title: "",
          } : {
            title: C.appName,
            headerLeft: () => (
              <MenuButton />
            ),
          }}
        />
        <MainStack.Screen
          name="NoteCreate"
          component={NotePropertiesScreen}
        />
        <MainStack.Screen
          name="NoteProps"
          component={NotePropertiesScreen}
        />
        <MainStack.Screen
          name="CollectionEdit"
          component={CollectionEditScreen}
        />
        <MainStack.Screen
          name="CollectionCreate"
          component={CollectionEditScreen}
        />
        <MainStack.Screen
          name="CollectionChangelog"
          component={CollectionChangelogScreen}
          options={{
            title: "Manage Notebook",
          }}
        />
        <MainStack.Screen
          name="CollectionMembers"
          component={CollectionMembersScreen}
          options={{
            title: "Collection Members",
          }}
        />
        <MainStack.Screen
          name="NoteEdit"
          component={NoteEditScreen}
        />
        <MainStack.Screen
          name="Invitations"
          component={InvitationsScreen}
          options={{
            title: "Collection Invitations",
          }}
        />
      </MainStack.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  separator: {
    width: 1,
    backgroundColor: "black",
  },
  leftScreen: {
    flex: 1,
    maxWidth: 360,
  },
  rightScreen: {
    flex: 2,
  },
});
