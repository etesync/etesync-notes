// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { View, Linking, Clipboard } from "react-native";
import { Button, Text, Paragraph, HelperText } from "react-native-paper";

import * as Updates from "expo-updates";

import * as Etebase from "etebase";

import { StoreState, persistor, store } from "./store";

import { Title } from "./widgets/Typography";
import ScrollView from "./widgets/ScrollView";
import { logger, LogLevel, getLogs } from "./logging";
import Container from "./widgets/Container";
import { expo } from "../app.json";
import * as C from "./constants";
import { setSettings, popNonFatalError, login } from "./store/actions";
import LogoutDialog from "./components/LogoutDialog";
import ConfirmationDialog from "./widgets/ConfirmationDialog";
import PasswordInput from "./widgets/PasswordInput";
import ExternalLink from "./widgets/ExternalLink";
import { useCredentials } from "./credentials";

function emailDevelopers(error: Error, logs: string | undefined) {
  const subject = encodeURIComponent(`${C.appName}: Crash Report`);
  const bodyJson = {
    version: expo.version,
    error: {
      message: error.message,
      stack: error.stack?.toString(),
      logs,
    },
  };
  const body = encodeURIComponent(JSON.stringify(bodyJson));
  Linking.openURL(`mailto:${C.reportsEmail}?subject=${subject}&body=${body}`);
}

function SessionExpiredDialog() {
  const etebase = useCredentials()!;
  const dispatch = useDispatch();
  const [password, setPassword] = React.useState("");
  const [errorPassword, setErrorPassword] = React.useState<string>();

  return (
    <ConfirmationDialog
      title="Session expired"
      visible
      onOk={async () => {
        if (!password) {
          setErrorPassword("Password is required");
          return;
        }

        try {
          await etebase.fetchToken();

          dispatch(login(etebase));

          store.dispatch(popNonFatalError());
        } catch (e) {
          setErrorPassword(e.message);
        }
      }}
      onCancel={() => {
        store.dispatch(popNonFatalError());
      }}
    >
      <>
        <Paragraph>
          Your login session has expired, please entry your login password:
        </Paragraph>
        <PasswordInput
          error={!!errorPassword}
          label="Password"
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
        />
        <HelperText
          type="error"
          visible={!!errorPassword}
        >
          {errorPassword}
        </HelperText>
        {!C.genericMode && (
          <>
            <ExternalLink href={C.forgotPassword}>
              <Text>Forget password?</Text>
            </ExternalLink>
          </>
        )}
      </>
    </ConfirmationDialog>
  );
}

function ErrorBoundaryInner(props: React.PropsWithChildren<{ error: Error | undefined }>) {
  const etesync = useCredentials();
  const [showLogout, setShowLogout] = React.useState(false);
  const errors = useSelector((state: StoreState) => state.errors);
  const error = props.error ?? errors.fatal?.last(undefined);
  const nonFatalErrorCount = errors.other?.count() ?? 0;
  const nonFatalError = errors.other?.last(undefined);
  const [logs, setLogs] = React.useState<string>();

  React.useEffect(() => {
    getLogs().then((value) => setLogs(value.join("\n")));
  }, []);

  const buttonStyle = { marginVertical: 5 };
  if (error) {
    logger.critical(error.toString());
    const content = `${error.message}\n${error.stack}\n${logs}`;
    return (
      <ScrollView>
        <Container>
          <Title>Something went wrong!</Title>
          <View style={{ marginVertical: 15, flexDirection: "row", justifyContent: "space-evenly", flexWrap: "wrap" }}>
            <Button mode="contained" style={buttonStyle} onPress={() => emailDevelopers(error, logs)}>Report Bug</Button>
            <Button mode="contained" style={buttonStyle} onPress={() => Clipboard.setString(content)}>Copy Text</Button>
            <Button mode="contained" style={buttonStyle} onPress={() => Updates.reloadAsync()}>Reload App</Button>
            <Button mode="contained" style={buttonStyle} onPress={async () => {
              store.dispatch(setSettings({ logLevel: LogLevel.Debug }));
              persistor.persist();
              Updates.reloadAsync();
            }}>Enable Logging &amp; Reload</Button>
            <Button disabled={!etesync} mode="contained" style={buttonStyle} onPress={() => setShowLogout(true)}>Logout &amp; Reload</Button>
          </View>
          <Text selectable>{content}</Text>
        </Container>
        <LogoutDialog visible={showLogout} onDismiss={(loggedOut) => {
          if (loggedOut) {
            Updates.reloadAsync();
          }
          setShowLogout(false);
        }}
        />
      </ScrollView>
    );
  }

  let nonFatalErrorDialog;
  if (nonFatalError) {
    if (nonFatalError instanceof Etebase.UnauthorizedError) {

      nonFatalErrorDialog = (
        <SessionExpiredDialog />
      );
    } else {
      nonFatalErrorDialog = (
        <ConfirmationDialog
          title={`Error (${nonFatalErrorCount} remaining)`}
          visible={!!nonFatalError}
          onOk={() => {
            store.dispatch(popNonFatalError());
          }}
        >
          <Paragraph>
            {nonFatalError?.toString()}
          </Paragraph>
        </ConfirmationDialog>
      );
    }
  }

  return <>
    {props.children}

    {nonFatalErrorDialog}
  </>;
}

interface PropsType {
  children: React.ReactNode | React.ReactNode[];
}

class ErrorBoundary extends React.Component<PropsType> {
  public state: {
    error?: Error;
  };

  constructor(props: PropsType) {
    super(props);
    this.state = { };
  }

  public componentDidCatch(error: Error) {
    this.setState({ error });
  }

  public render() {
    return (
      <ErrorBoundaryInner error={this.state.error}>
        {this.props.children}
      </ErrorBoundaryInner>
    );
  }
}

export default ErrorBoundary;
