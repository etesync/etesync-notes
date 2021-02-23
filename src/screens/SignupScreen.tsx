// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import * as Etebase from "etebase";

import { View, TextInput as NativeTextInput } from "react-native";
import { Switch, Text, HelperText, Paragraph, TouchableRipple } from "react-native-paper";

import { Headline } from "../widgets/Typography";
import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import TextInput from "../widgets/TextInput";
import PasswordInput from "../widgets/PasswordInput";
import Alert from "../widgets/Alert";
import Row from "../widgets/Row";
import FormButton from "../widgets/FormButton";

import { useAsyncDispatch } from "../store";

import { login } from "../store/actions";
import { enforcePasswordRules } from "../helpers";

import * as C from "../constants";
import { useCredentials } from "../credentials";
import LinkButton from "../widgets/LinkButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../NavigationConfig";

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  server?: string;

  general?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, "Signup">;

// Can be used to force always showing advance, e.g. for genericMode
const alwaysShowAdvanced = false;

export default React.memo(function SignupScreen() {
  const etebase = useCredentials();
  const dispatch = useAsyncDispatch();
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [server, setServer] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(alwaysShowAdvanced);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});

  const usernameRef = React.useRef<NativeTextInput>();
  const emailRef = React.useRef<NativeTextInput>();
  const passwordRef = React.useRef<NativeTextInput>();
  const serverRef = React.useRef<NativeTextInput>();

  async function onSubmit() {
    const serverUrl = showAdvanced ? server : undefined;

    const errors: FormErrors = {};
    const fieldRequired = "This field is required!";
    if (!email) {
      errors.email = fieldRequired;
    } else if (!email.includes("@")) {
      errors.email = "Valid email address required.";
    }
    if (!username) {
      errors.username = fieldRequired;
    }
    if (!password) {
      errors.password = fieldRequired;
    } else {
      const passwordRulesError = enforcePasswordRules(password);
      if (passwordRulesError) {
        errors.password = passwordRulesError;
      }
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const user: Etebase.User = {
        username,
        email,
      };
      const etebase = await Etebase.Account.signup(user, password, serverUrl ?? C.serviceApiBase);
      dispatch(login(etebase));
      navigation.navigate("AccountWizard");
    } catch (e) {
      if ((e instanceof Etebase.HttpError) && (e.content)) {
        let found = false;
        if (e.content.errors) {
          for (const field of e.content.errors) {
            if (field.field === "user.username") {
              errors.username = field.detail;
              found = true;
            } else if (field.field === "user.email") {
              errors.email = field.detail;
              found = true;
            } else if (!field.field) {
              errors.general = field.detail;
              found = true;
            }
          }
        }

        if (!found) {
          errors.general = e.content.detail ?? e.toString();
        }
      } else {
        errors.general = e.toString();
      }
      setErrors(errors);
    } finally {
      setLoading(false);
    }
  }

  if (etebase) {
    return <React.Fragment />;
  }

  return (
    <ScrollView keyboardAware>
      <Container>
        <Headline>Signup</Headline>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <Text> or </Text><LinkButton to="/login">log in to your account</LinkButton>
        </View>

        <Alert
          style={{ marginTop: 10 }}
          severity="info"
          to={C.pricing}
          external
        >
          You are signing up for a free trial. Click here for pricing information.
        </Alert>
        <View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoCompleteType="username"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current!.focus()}
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

          {errors.general && (
            <Alert severity="error" style={{ marginBottom: 10 }}>{errors.general}</Alert>
          )}

          <Alert
            style={{ marginBottom: 10 }}
            severity="warning"
          >
            Please make sure you remember your password, as it can't be recovered if lost!
          </Alert>

          <FormButton
            onPress={onSubmit}
            disabled={loading}
            loading={loading}
          >
            Signup
          </FormButton>
        </View>
      </Container>
    </ScrollView>
  );
});
