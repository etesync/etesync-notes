// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import { Text, View, TextInput as NativeTextInput } from "react-native";
import { Switch, Button, HelperText, Paragraph, TouchableRipple } from "react-native-paper";


import ExternalLink from "../widgets/ExternalLink";
import Row from "../widgets/Row";
import TextInput from "../widgets/TextInput";
import Alert from "../widgets/Alert";

import * as C from "../constants";
import PasswordInput from "../widgets/PasswordInput";
import { enforcePasswordRules } from "../helpers";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  server?: string;
}

// Can be used to force always showing advance, e.g. for genericMode
const alwaysShowAdvanced = false;

interface PropsType {
  onSubmit?: (username: string, password: string, serviceApiUrl?: string) => void;
  onSignup?: (username: string, email: string, password: string, serviceApiUrl?: string) => void;
}

export default function LoginForm(props: PropsType) {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [server, setServer] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(alwaysShowAdvanced);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const usernameRef = React.useRef<NativeTextInput>();
  const emailRef = React.useRef<NativeTextInput>();
  const passwordRef = React.useRef<NativeTextInput>();
  const serverRef = React.useRef<NativeTextInput>();

  function onSubmit() {
    const serverUrl = showAdvanced ? server : undefined;

    const errors: FormErrors = {};
    const fieldRequired = "This field is required!";
    if (props.onSignup) {
      if (!email) {
        errors.email = fieldRequired;
      } else if (!email.includes("@")) {
        errors.email = "Valid email address required.";
      }
    }
    if (!username) {
      errors.username = fieldRequired;
    }
    if (!password) {
      errors.password = fieldRequired;
    } else if (props.onSignup) {
      const passwordRulesError = enforcePasswordRules(password);
      if (passwordRulesError) {
        errors.password = passwordRulesError;
      }
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    if (props.onSubmit) {
      props.onSubmit(username, password, serverUrl);
    } else {
      props.onSignup!(username, email, password, serverUrl);
    }
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
          onSubmitEditing={() => (emailRef.current ?? passwordRef.current)!.focus()}
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

        {(props.onSignup) && (
          <>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current!.focus()}
              ref={emailRef}
              error={!!errors.email}
              onChangeText={setEmail}
              label="Email address"
              accessibilityLabel="Email address"
              value={email}
            />
            <HelperText
              type="error"
              visible={!!errors.email}
            >
              {errors.email}
            </HelperText>
          </>
        )}


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

        {props.onSignup && (
          <Alert
            style={{ marginBottom: 10 }}
            severity="warning"
          >
            Please make sure you remember your password, as it can't be recovered if lost!
          </Alert>
        )}

        <Button
          mode="contained"
          onPress={onSubmit}
        >
          {props.onSignup ? (
            <Text>Signup</Text>
          ) : (
            <Text>Log In</Text>
          )}
        </Button>
      </View>
    </>
  );
}
