// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import { View, TextInput as NativeTextInput } from "react-native";
import { Switch, Button, HelperText, Paragraph, TouchableRipple } from "react-native-paper";


import ExternalLink from "../widgets/ExternalLink";
import Row from "../widgets/Row";
import TextInput from "../widgets/TextInput";

import * as C from "../constants";
import PasswordInput from "../widgets/PasswordInput";

interface FormErrors {
  username?: string;
  password?: string;
  server?: string;
}

// Can be used to force always showing advance, e.g. for genericMode
const alwaysShowAdvanced = false;

interface PropsType {
  onSubmit: (username: string, password: string, serviceApiUrl?: string) => void;
}

export default function LoginForm(props: PropsType) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [server, setServer] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(alwaysShowAdvanced);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const usernameRef = React.useRef<NativeTextInput>();
  const passwordRef = React.useRef<NativeTextInput>();
  const serverRef = React.useRef<NativeTextInput>();

  function onSubmit() {
    const serverUrl = showAdvanced ? server : undefined;

    const errors: FormErrors = {};
    const fieldRequired = "This field is required!";
    if (!username) {
      errors.username = fieldRequired;
    } else if (username.includes("@")) {
      errors.username = "Please use your username (not email)";
    }
    if (!password) {
      errors.password = fieldRequired;
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    props.onSubmit(username, password, serverUrl);
  }

  return (
    <>
      <View>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          autoCompleteType="username"
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => (passwordRef.current)!.focus()}
          ref={usernameRef}
          error={!!errors.username}
          onChangeText={setUsername}
          label="Username"
          accessibilityLabel="Username"
          value={username}
        />
        <HelperText
          type="error"
          visible={!!errors.username}
        >
          {errors.username}
        </HelperText>

        <PasswordInput
          autoCompleteType="password"
          returnKeyType={showAdvanced ? "next" : undefined}
          onSubmitEditing={() => serverRef.current?.focus()}
          ref={passwordRef}
          error={!!errors.password}
          label="Password"
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
        />
        <HelperText
          type="error"
          visible={!!errors.password}
        >
          {errors.password}
        </HelperText>
        {!C.genericMode && (
          <>
            <ExternalLink href={C.forgotPassword}>
              Forget password?
            </ExternalLink>
          </>
        )}

        <TouchableRipple
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Row style={{ paddingVertical: 8, justifyContent: "space-between" }}>
            <Paragraph>Advanced settings</Paragraph>
            <View pointerEvents="none">
              <Switch value={showAdvanced} />
            </View>
          </Row>
        </TouchableRipple>

        {showAdvanced && (
          <>
            <TextInput
              keyboardType="url"
              textContentType="URL"
              autoCapitalize="none"
              autoCorrect={false}
              error={!!errors.server}
              label="Server URL"
              accessibilityLabel="Server URL"
              value={server}
              placeholder="E.g. https://api.etebase.com"
              onChangeText={setServer}
              ref={serverRef}
            />
            <HelperText
              type="error"
              visible={!!errors.server}
            >
              {errors.server}
            </HelperText>
          </>
        )}
        <HelperText
          type="error"
          visible={false}
        >
          <React.Fragment />
        </HelperText>

        <Button
          mode="contained"
          onPress={onSubmit}
        >
          Log In
        </Button>
      </View>
    </>
  );
}
