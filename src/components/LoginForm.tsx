// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";

import { Text, View, TextInput as NativeTextInput } from "react-native";
import { Switch, Button, HelperText, Paragraph, TouchableRipple } from "react-native-paper";


import ExternalLink from "../widgets/ExternalLink";
import Row from "../widgets/Row";
import TextInput from "../widgets/TextInput";

import * as C from "../constants";
import PasswordInput from "../widgets/PasswordInput";

interface FormErrors {
  errorEmail?: string;
  errorPassword?: string;
  errorServer?: string;
}

// Can be used to force always showing advance, e.g. for genericMode
const alwaysShowAdvanced = false;

class LoginForm extends React.PureComponent {
  public state: {
    showAdvanced: boolean;
    errors: FormErrors;

    server: string;
    username: string;
    password: string;
  };

  public props: {
    onSubmit: (username: string, password: string, serviceApiUrl?: string) => void;
  };

  private formRefs: React.RefObject<NativeTextInput>[];

  constructor(props: any) {
    super(props);
    this.state = {
      showAdvanced: alwaysShowAdvanced,
      errors: {},
      server: "",
      username: "",
      password: "",
    };
    this.generateEncryption = this.generateEncryption.bind(this);
    this.toggleAdvancedSettings = this.toggleAdvancedSettings.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.formRefs = [React.createRef<NativeTextInput>(), React.createRef<NativeTextInput>(), React.createRef<NativeTextInput>()];
  }

  public handleInputChange(name: string) {
    return (value: string) => {
      this.setState({
        [name]: value,
      });
    };
  }

  public generateEncryption() {
    const server = this.state.showAdvanced ? this.state.server : undefined;

    const username = this.state.username;
    const password = this.state.password;

    const errors: FormErrors = {};
    const fieldRequired = "This field is required!";
    if (!username) {
      errors.errorEmail = fieldRequired;
    }
    if (!password) {
      errors.errorPassword = fieldRequired;
    }

    this.setState({ errors });
    if (Object.keys(errors).length > 0) {
      return;
    }

    this.props.onSubmit(username, password, server);
  }

  public toggleAdvancedSettings() {
    this.setState({ showAdvanced: !this.state.showAdvanced });
  }

  public render() {
    const advancedSettings = (
      <>
        <TextInput
          keyboardType="url"
          textContentType="URL"
          autoCapitalize="none"
          autoCorrect={false}
          error={!!this.state.errors.errorServer}
          label="Server URL"
          accessibilityLabel="Server URL"
          value={this.state.server}
          placeholder="E.g. https://api.etebase.com"
          onChangeText={this.handleInputChange("server")}
          ref={this.formRefs[2]}
        />
        <HelperText
          type="error"
          visible={!!this.state.errors.errorServer}
        >
          {this.state.errors.errorServer}
        </HelperText>
      </>
    );

    return (
      <>
        <View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoCompleteType="username"
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => this.formRefs[1].current!.focus()}
            ref={this.formRefs[0]}
            error={!!this.state.errors.errorEmail}
            onChangeText={this.handleInputChange("username")}
            label="Username"
            accessibilityLabel="Username"
            value={this.state.username}
          />
          <HelperText
            type="error"
            visible={!!this.state.errors.errorEmail}
          >
            {this.state.errors.errorEmail}
          </HelperText>

          <PasswordInput
            autoCompleteType="password"
            returnKeyType={this.state.showAdvanced ? "next" : undefined}
            onSubmitEditing={this.state.showAdvanced ? (() => this.formRefs[2].current!.focus()) : undefined}
            ref={this.formRefs[1]}
            error={!!this.state.errors.errorPassword}
            label="Password"
            accessibilityLabel="Password"
            value={this.state.password}
            onChangeText={this.handleInputChange("password")}
          />
          <HelperText
            type="error"
            visible={!!this.state.errors.errorPassword}
          >
            {this.state.errors.errorPassword}
          </HelperText>
          {!C.genericMode && (
            <>
              <ExternalLink href={C.forgotPassword}>
                <Text>Forget password?</Text>
              </ExternalLink>
            </>
          )}

          <TouchableRipple
            onPress={() =>
              this.setState((state: any) => ({
                showAdvanced: !state.showAdvanced,
              }))
            }
          >
            <Row style={{ paddingVertical: 8, justifyContent: "space-between" }}>
              <Paragraph>Advanced settings</Paragraph>
              <View pointerEvents="none">
                <Switch value={this.state.showAdvanced} />
              </View>
            </Row>
          </TouchableRipple>

          {this.state.showAdvanced && advancedSettings}
          <HelperText
            type="error"
            visible={false}
          >
            <React.Fragment />
          </HelperText>

          <Button
            mode="contained"
            onPress={this.generateEncryption}
          >
            <Text>Log In</Text>
          </Button>
        </View>
      </>
    );
  }
}

export default LoginForm;

