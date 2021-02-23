import * as React from "react";
import { TextInput as NativeTextInput } from "react-native";
import { Button, HelperText } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import * as Etebase from "etebase";

import { useCredentials } from "../credentials";
import { useAsyncDispatch } from "../store";
import { login, pushMessage } from "../store/actions";

import { startTask, enforcePasswordRules, useLoading } from "../helpers";
import { logger } from "../logging";

import Alert from "../widgets/Alert";
import Container from "../widgets/Container";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";
import PasswordInput from "../widgets/PasswordInput";
import ScrollView from "../widgets/ScrollView";

import { RootStackParamList } from "../NavigationConfig";

interface PasswordFormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Settings">;

export default function ChangePasswordScreen() {
  const etebase = useCredentials()!;
  const dispatch = useAsyncDispatch();
  const [errors, setErrors] = React.useState<PasswordFormErrors>({});
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, error, setPromise] = useLoading();
  const navigation = useNavigation<NavigationProp>();

  async function onSave() {
    setPromise(async () => {
      const fieldNotEmpty = "Password can't be empty.";
      const errors: PasswordFormErrors = {};
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
      if (!confirmPassword) {
        errors.confirmPassword = fieldNotEmpty;
      } else if (confirmPassword !== newPassword) {
        errors.confirmPassword = "The passwords do not match";
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
          navigation.goBack();
        } catch (e) {
          setErrors({ newPassword: e.toString() });
        }
      });
    });
  }

  const newPasswordRef = React.createRef<NativeTextInput>();
  const confirmPasswordRef = React.createRef<NativeTextInput>();

  return (
    <ScrollView keyboardAware>
      <Container>
        <ErrorOrLoadingDialog
          loading={loading}
          error={error}
          onDismiss={() => setPromise(undefined)}
        />
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

        <PasswordInput
          ref={confirmPasswordRef}
          error={!!errors.confirmPassword}
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <HelperText
          type="error"
          visible={!!errors.confirmPassword}
        >
          {errors.confirmPassword}
        </HelperText>

        <Alert
          severity="warning"
        >
          Please make sure you remember your password, as it can't be recovered if lost!
        </Alert>

        <Button
          mode="contained"
          disabled={loading}
          onPress={onSave}
        >
          {loading ? "Loading…" : "Save"}
        </Button>
      </Container>
    </ScrollView>
  );
}