// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import * as Etebase from "etebase";

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


const LoginScreen = React.memo(function _LoginScreen() {
  const etebase = useCredentials();
  const dispatch = useAsyncDispatch();
  const [loading, error, setPromise] = useLoading();

  function onFormSubmit(username: string, password: string, serviceApiUrl?: string) {
    setPromise((async () => {
      const etebase = await Etebase.Account.login(username, password, serviceApiUrl ?? C.serviceApiBase);
      dispatch(login(etebase));
    })());
  }

  if (etebase) {
    return <React.Fragment />;
  }

  return (
    <ScrollView keyboardAware>
      <Container>
        <Headline>Please Log In</Headline>
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
