// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Snackbar } from "react-native-paper";

import { SyncManager } from "./sync/SyncManager";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AboutScreen from "./screens/AboutScreen";
import DebugLogsScreen from "./screens/DebugLogsScreen";
import NoteListScreen from "./screens/NoteListScreen";
import NoteEditScreen from "./screens/NoteEditScreen";
import NotePropertiesScreen from "./screens/NotePropertiesScreen";
import CollectionEditScreen from "./screens/CollectionEditScreen";
import CollectionChangelogScreen from "./screens/CollectionChangelogScreen";
import CollectionMembersScreen from "./screens/CollectionMembersScreen";
import InvitationsScreen from "./screens/InvitationsScreen";
import AccountWizardScreen from "./screens/AccountWizardScreen";
import NotFoundScreen from "./screens/NotFoundScreen";

import { useCredentials } from "./credentials";
import { performSync, popMessage } from "./store/actions";

import { useAppStateCb } from "./helpers";

import * as C from "./constants";
import { StoreState } from "./store";
import { RootStackParamList } from "./RootStackParamList";
import MenuButton from "./widgets/MenuButton";
import Appbar from "./widgets/Appbar";

const Stack = createStackNavigator<RootStackParamList>();

export default React.memo(function RootNavigator() {
  const dispatch = useDispatch();
  const etebase = useCredentials();

  // Sync app when it goes to background
  useAppStateCb((_foreground) => {
    if (etebase) {
      // FIXME: We should only sync when moving to foreground if haven't in X minutes
      const syncManager = SyncManager.getManager(etebase);
      dispatch(performSync(syncManager.sync()));
    }
  });

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          header: (props) => <Appbar {...props} menuFallback />,
          cardStyle: {
            maxHeight: "100%",
          },
        }}
      >
        {(etebase === null) ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: "Login",
                headerLeft: () => (
                  <MenuButton />
                ),
              }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                title: "Signup",
                headerLeft: () => (
                  <MenuButton />
                ),
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={NoteListScreen}
              options={{
                title: C.appName,
                headerLeft: () => (
                  <MenuButton />
                ),
              }}
            />
            <Stack.Screen
              name="Collection"
              component={NoteListScreen}
              options={{
                title: C.appName,
                headerLeft: () => (
                  <MenuButton />
                ),
              }}
            />
            <Stack.Screen
              name="NoteCreate"
              component={NotePropertiesScreen}
            />
            <Stack.Screen
              name="NoteProps"
              component={NotePropertiesScreen}
            />
            <Stack.Screen
              name="CollectionEdit"
              component={CollectionEditScreen}
            />
            <Stack.Screen
              name="CollectionCreate"
              component={CollectionEditScreen}
            />
            <Stack.Screen
              name="CollectionChangelog"
              component={CollectionChangelogScreen}
              options={{
                title: "Manage Notebook",
              }}
            />
            <Stack.Screen
              name="CollectionMembers"
              component={CollectionMembersScreen}
              options={{
                title: "Collection Members",
              }}
            />
            <Stack.Screen
              name="NoteEdit"
              component={NoteEditScreen}
            />
            <Stack.Screen
              name="Invitations"
              component={InvitationsScreen}
              options={{
                title: "Collection Invitations",
              }}
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
        {/* We keep this outside of the guarded routes so we can navigate to it from the login/signup screens */}
        <Stack.Screen
          name="AccountWizard"
          component={AccountWizardScreen}
          options={{
            title: C.appName,
          }}
        />
        <Stack.Screen
          name="404"
          component={NotFoundScreen}
          options={{
            title: "Page Not Found",
            headerLeft: () => (
              <MenuButton />
            ),
          }}
        />
      </Stack.Navigator>
      <GlobalMessages />
    </>
  );
});

function GlobalMessages() {
  const dispatch = useDispatch();
  const message = useSelector((state: StoreState) => state.messages.first(undefined));

  function handleClose() {
    dispatch(popMessage());
  }

  // FIXME: handle severity
  return (
    <Snackbar
      key={message?.message}
      visible={!!message}
      duration={5000}
      onDismiss={handleClose}
      action={{
        label: "Dismiss",
        onPress: handleClose,
      }}
    >
      {message?.message}
    </Snackbar>
  );
}

