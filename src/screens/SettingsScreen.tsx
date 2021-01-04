// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { TextInput as NativeTextInput, Linking } from "react-native";
import { List, HelperText, Switch, useTheme, Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import * as Updates from "expo-updates";

import * as Etebase from "etebase";

import { logger, LogLevel } from "../logging";

import { useCredentials } from "../credentials";

import ScrollView from "../widgets/ScrollView";
import ConfirmationDialog from "../widgets/ConfirmationDialog";
import PasswordInput from "../widgets/PasswordInput";

import { StoreState, useAsyncDispatch } from "../store";
import { setSettings, login, pushMessage } from "../store/actions";
import { ViewModeKey } from "../store/reducers";

import * as C from "../constants";
import { startTask, enforcePasswordRules } from "../helpers";
import { useNavigation } from "@react-navigation/native";
import Alert from "../widgets/Alert";
import FontSelector from "../widgets/FontSelector";
import Select from "../widgets/Select";

interface DialogPropsType {
  visible: boolean;
  onDismiss: () => void;
}

interface EncryptionFormErrors {
  oldPassword?: string;
  newPassword?: string;
}

function ChangePasswordDialog(props: DialogPropsType) {
  const etebase = useCredentials()!;
  const dispatch = useAsyncDispatch();
  const [errors, setErrors] = React.useState<EncryptionFormErrors>({});
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");

  async function onOk() {
    const fieldNotEmpty = "Password can't be empty.";
    const errors: EncryptionFormErrors = {};
    if (!oldPassword) {
      errors.oldPassword = fieldNotEmpty;
    }
    if (!newPassword) {
      errors.newPassword = fieldNotEmpty;
    } else {
      const passwordRulesError = enforcePasswordRules(newPassword);
      if (passwordRulesError) {
        errors.newPassword = passwordRulesError;
      }
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    await startTask(async () => {
      const serverUrl = etebase.serverUrl;
      logger.info("Changing encryption password");
      logger.info("Verifying old key");
      const username = etebase.user.username;
      try {
        const etebase = await Etebase.Account.login(username, oldPassword, serverUrl);
        await etebase.logout();
      } catch (e) {
        if (e instanceof Etebase.UnauthorizedError) {
          setErrors({ oldPassword: "Error: wrong encryption password." });
        } else {
          setErrors({ oldPassword: e.toString() });
        }
        return;
      }

      logger.info("Setting new password");
      try {
        await etebase.changePassword(newPassword);
        dispatch(login(etebase));
        dispatch(pushMessage({ message: "Password successfully changed.", severity: "success" }));
        props.onDismiss();
      } catch (e) {
        setErrors({ newPassword: e.toString() });
      }
    });
  }

  const newPasswordRef = React.createRef<NativeTextInput>();

  return (
    <ConfirmationDialog
      title="Change Encryption Password"
      visible={props.visible}
      onOk={onOk}
      onCancel={props.onDismiss}
      isEditingHack
    >
      <>
        <PasswordInput
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current!.focus()}
          error={!!errors.oldPassword}
          label="Current Password"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <HelperText
          type="error"
          visible={!!errors.oldPassword}
        >
          {errors.oldPassword}
        </HelperText>

        <PasswordInput
          ref={newPasswordRef}
          error={!!errors.newPassword}
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <HelperText
          type="error"
          visible={!!errors.newPassword}
        >
          {errors.newPassword}
        </HelperText>

        <Alert
          severity="warning"
        >
          Please make sure you remember your password, as it can't be recovered if lost!
        </Alert>
      </>
    </ConfirmationDialog>
  );
}

function DarkModePreferenceSelector() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [selectDarkModeOpen, setDarkModePreferenceOpen] = React.useState(false);
  const darkModePreference = useSelector((state: StoreState) => state.settings.theme);
  const prettyName = {
    auto: "Auto",
    dark: "Dark",
    light: "Light",
  };

  return (
    <List.Item
      title="Theme"
      description="Set the app's theme to dark, light or auto"
      right={(props) =>
        <Select
          {...props}
          visible={selectDarkModeOpen}
          onDismiss={() => setDarkModePreferenceOpen(false)}
          options={["auto", "dark", "light"]}
          titleAccossor={(x) => prettyName[x]}
          onChange={(selected) => {
            setDarkModePreferenceOpen(false);
            if (selected === darkModePreference) {
              return;
            }
            dispatch(setSettings({ theme: selected as typeof darkModePreference }));
          }}
          anchor={(
            <Button mode="contained" color={theme.colors.accent} onPress={() => setDarkModePreferenceOpen(true)}>{prettyName[darkModePreference]}</Button>
          )}
        />
      }
    />
  );
}

function FontSizePreferenceSelector() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [selectFontSizeOpen, setFontSizePreferenceOpen] = React.useState(false);
  const fontSizePreference = useSelector((state: StoreState) => state.settings.fontSize);
  const prettyName = {
    8: "Extra Small",
    12: "Small",
    16: "Medium",
    20: "Large",
    24: "Extra Large",
  };

  return (
    <List.Item
      title="Font Size"
      description="Set the content's font size"
      right={(props) =>
        <Select
          {...props}
          visible={selectFontSizeOpen}
          onDismiss={() => setFontSizePreferenceOpen(false)}
          options={Object.keys(prettyName)}
          titleAccossor={(x) => prettyName[x]}
          onChange={(selected_) => {
            setFontSizePreferenceOpen(false);
            const selected = (selected_ !== null) ? parseInt(selected_) : null;
            if (selected === fontSizePreference) {
              return;
            }
            dispatch(setSettings({ fontSize: selected as typeof fontSizePreference }));
          }}
          anchor={(
            <Button mode="contained" color={theme.colors.accent} onPress={() => setFontSizePreferenceOpen(true)}>{fontSizePreference && prettyName[fontSizePreference]}</Button>
          )}
        />
      }
    />
  );
}

function EditorFontFamilyPreferenceSelector() {
  const dispatch = useDispatch();
  const [selectEditorFontFamilyOpen, setEditorFontFamilyPreferenceOpen] = React.useState(false);
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { editorFontFamily } = viewSettings;

  return (
    <List.Item
      title="Editor Font"
      description="Set the font used in the note editor"
      right={(props) =>
        <FontSelector
          {...props}
          visible={selectEditorFontFamilyOpen}
          selected={editorFontFamily ?? "monospace"}
          onOpen={() => setEditorFontFamilyPreferenceOpen(true)}
          onDismiss={() => setEditorFontFamilyPreferenceOpen(false)}
          onChange={(selected) => {
            setEditorFontFamilyPreferenceOpen(false);
            if (selected == null || selected === editorFontFamily) {
              return;
            }
            dispatch(setSettings({
              viewSettings: {
                ...viewSettings,
                editorFontFamily: selected,
              },
            }));
          }}
        />
      }
    />
  );
}

function ViewerFontFamilyPreferenceSelector() {
  const dispatch = useDispatch();
  const [selectViewerFontFamilyOpen, setViewerFontFamilyPreferenceOpen] = React.useState(false);
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { viewerFontFamily } = viewSettings;

  return (
    <List.Item
      title="Preview Font"
      description="Set the font used in the note preview"
      right={(props) =>
        <FontSelector
          {...props}
          visible={selectViewerFontFamilyOpen}
          selected={viewerFontFamily ?? "regular"}
          onOpen={() => setViewerFontFamilyPreferenceOpen(true)}
          onDismiss={() => setViewerFontFamilyPreferenceOpen(false)}
          onChange={(selected) => {
            setViewerFontFamilyPreferenceOpen(false);
            if (selected == null || selected === viewerFontFamily) {
              return;
            }
            dispatch(setSettings({
              viewSettings: {
                ...viewSettings,
                viewerFontFamily: selected as typeof viewerFontFamily,
              },
            }));
          }}
        />
      }
    />
  );
}

function ViewModePreferenceSelector() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [selectViewModeOpen, setViewModePreferenceOpen] = React.useState(false);
  const viewSettings = useSelector((state: StoreState) => state.settings.viewSettings);
  const { defaultViewMode } = viewSettings;

  const options: ViewModeKey[] = ["last", "viewer", "editor"];

  const prettyName: Record<ViewModeKey, string> = {
    last: "Last used",
    viewer: "Preview",
    editor: "Editor",
  };

  return (
    <List.Item
      title="Default View Mode"
      description="Set the default view mode for notes"
      right={(props) =>
        <Select
          {...props}
          visible={selectViewModeOpen}
          onDismiss={() => setViewModePreferenceOpen(false)}
          options={options}
          titleAccossor={(x) => prettyName[x]}
          onChange={(selected) => {
            setViewModePreferenceOpen(false);
            if (!selected || selected === defaultViewMode) {
              return;
            }
            dispatch(setSettings({
              viewSettings: {
                ...viewSettings,
                defaultViewMode: selected,
              },
            }));
          }}
          anchor={(
            <Button mode="contained" color={theme.colors.accent} onPress={() => setViewModePreferenceOpen(true)}>{prettyName[defaultViewMode]}</Button>
          )}
        />
      }
    />
  );
}

const SettingsScreen = function _SettingsScreen() {
  const etebase = useCredentials();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const settings = useSelector((state: StoreState) => state.settings);

  const [showChangePasswordDialog, setShowChangePasswordDialog] = React.useState(false);

  const loggedIn = !!etebase;

  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        {loggedIn && (
          <List.Section>
            <List.Subheader>Account</List.Subheader>
            {!C.genericMode &&
              <List.Item
                title="Account Dashboard"
                description="Change your payment info, plan and other account settings"
                onPress={async () => {
                  try {
                    const url = await etebase!.getDashboardUrl();
                    Linking.openURL(url);
                  } catch (e) {
                    dispatch(pushMessage({ message: e.message, severity: "error" }));
                  }
                }}
              />
            }
            <List.Item
              title="Change Password"
              description="Change your account's password"
              onPress={() => { setShowChangePasswordDialog(true) }}
            />
          </List.Section>
        )}

        <List.Section>
          <List.Subheader>General</List.Subheader>
          <DarkModePreferenceSelector />
          <FontSizePreferenceSelector />
          <EditorFontFamilyPreferenceSelector />
          <ViewerFontFamilyPreferenceSelector />
          <ViewModePreferenceSelector />
          <List.Item
            title="About"
            description="About and open source licenses"
            onPress={() => {
              navigation.navigate("About");
            }}
          />
        </List.Section>

        {!C.genericMode && (
          <List.Section>
            <List.Subheader>Debugging</List.Subheader>
            <List.Item
              title="Enable Logging"
              description={(settings.logLevel === LogLevel.Off) ? "Click to enable debug logging" : "Click to disable debug logging"}
              accessible={false}
              right={(props) =>
                <Switch
                  {...props}
                  color={theme.colors.accent}
                  value={settings.logLevel !== LogLevel.Off}
                  onValueChange={(value) => {
                    dispatch(setSettings({ logLevel: (value) ? LogLevel.Debug : LogLevel.Off }));
                  }}
                />
              }
            />
            <List.Item
              title="View Logs"
              description="View previously collected debug logs"
              onPress={() => {
                navigation.navigate("DebugLogs");
              }}
            />
            <List.Item
              title="Download Updates"
              description="Download and run app updates"
              onPress={async () => {
                try {
                  const check = await Updates.checkForUpdateAsync();
                  if (check.isAvailable) {
                    dispatch(pushMessage({ message: "Dowloading update", severity: "info" }));
                    await Updates.fetchUpdateAsync();
                    await Updates.reloadAsync();
                  } else {
                    dispatch(pushMessage({ message: "Already on most recent version", severity: "info" }));
                  }
                } catch (e) {
                  dispatch(pushMessage({ message: `Error: ${e.message}`, severity: "error" }));
                }
              }}
            />
          </List.Section>
        )}
      </ScrollView>

      <ChangePasswordDialog visible={showChangePasswordDialog} onDismiss={() => setShowChangePasswordDialog(false)} />
    </>
  );
};

export default SettingsScreen;
