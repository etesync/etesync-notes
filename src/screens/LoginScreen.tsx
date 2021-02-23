// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import * as Etebase from "etebase";

import { View } from "react-native";
import { Text } from "react-native-paper";

import { Headline } from "../widgets/Typography";
import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import ErrorOrLoadingDialog from "../widgets/ErrorOrLoadingDialog";
import LoginForm from "../components/LoginForm";

import { useAsyncDispatch } from "../store";

import { login } from "../store/actions";
import { useLoading } from "../helpers";

import * as C from "../constants";
import { useCredentials } from "../credentials";
import LinkButton from "../widgets/LinkButton";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../NavigationConfig";

type NavigationProp = StackNavigationProp<RootStackParamList, "Login">;

const LoginScreen = React.memo(function _LoginScreen() {
  const etebase = useCredentials();
  const dispatch = useAsyncDispatch();
  const navigation = useNavigation<NavigationProp>();
  const [loading, error, setPromise] = useLoading();

  function onFormSubmit(username: string, password: string, serviceApiUrl?: string) {
    setPromise((async () => {
      const etebase = await Etebase.Account.login(username, password, serviceApiUrl ?? C.serviceApiBase);
      dispatch(login(etebase));
      navigation.navigate("AccountWizard");
    })());
  }

  if (etebase) {
    return <React.Fragment />;
  }

  return (
    <ScrollView keyboardAware>
      <Container>
        <Headline>Please Log In</Headline>
        {!C.genericMode && (
          <View style={{ alignItems: "center", flexDirection: "row" }}>
            <Text> or </Text><LinkButton to="/signup">create an account</LinkButton>
          </View>
        )}
        <LoginForm
          onSubmit={onFormSubmit}
        />
        <ErrorOrLoadingDialog
          loading={loading}
          error={error}
          onDismiss={() => setPromise(undefined)}
        />
      </Container>
    </ScrollView>
  );
});

export default LoginScreen;
