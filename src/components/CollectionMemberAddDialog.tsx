// SPDX-FileCopyrightText: © 2017 EteSync Authors
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from "react";

import * as Etebase from "etebase";

import { Paragraph } from "react-native-paper";

import { useCredentials } from "../credentials";

import TextInput from "../widgets/TextInput";
import Checkbox from "../widgets/Checkbox";
import PrettyFingerprint from "../widgets/PrettyFingerprint";
import LoadingIndicator from "../widgets/LoadingIndicator";
import ConfirmationDialog from "../widgets/ConfirmationDialog";


interface PropsType {
  onOk: (username: string, publicKey: Uint8Array, accessLevel: Etebase.CollectionAccessLevel) => void;
  onClose: () => void;
}

export default function CollectionMemberAddDialog(props: PropsType) {
  const etebase = useCredentials()!;
  const [publicKey, setPublicKey] = React.useState<Uint8Array>();
  const [readOnly, setReadOnly] = React.useState(false);
  const [userChosen, setUserChosen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [error, setError] = React.useState<Error>();

  async function onAddRequest() {
    setUserChosen(true);
    const inviteMgr = etebase.getInvitationManager();
    try {
      const userProfile = await inviteMgr.fetchUserProfile(username);
      setPublicKey(userProfile.pubkey);
    } catch (e) {
      setError(e);
    }
  }

  function onOk() {
    props.onOk(username, publicKey!, readOnly ? Etebase.CollectionAccessLevel.ReadOnly : Etebase.CollectionAccessLevel.ReadWrite);
  }

  const { onClose } = props;

  if (error) {
    return (
      <>
        <ConfirmationDialog
          title="Error adding member"
          labelOk="OK"
          visible
          onOk={onClose}
          onCancel={onClose}
        >
          <Paragraph>
            User ({username}) not found. Have they setup their encryption password from one of the apps?
          </Paragraph>
        </ConfirmationDialog>
      </>
    );
  }

  if (publicKey) {
    return (
      <>
        <ConfirmationDialog
          title="Verify security fingerprint"
          labelOk="OK"
          visible
          onOk={onOk}
          onCancel={onClose}
        >
          <Paragraph>
            Verify {username}'s security fingerprint to ensure the encryption is secure.
          </Paragraph>
          <PrettyFingerprint style={{ textAlign: "center" }} publicKey={publicKey} />
        </ConfirmationDialog>
      </>
    );
  } else {
    return (
      <>
        <ConfirmationDialog
          title="Invite user"
          labelOk="OK"
          visible={!userChosen}
          onOk={onAddRequest}
          onCancel={onClose}
        >
          {userChosen ?
            <LoadingIndicator />
            :
            <>
              <TextInput
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onChangeText={setUsername}
                label="Username"
                accessibilityLabel="Username"
                value={username}
              />
              <Checkbox
                title="Read only?"
                status={readOnly}
                onPress={() => { setReadOnly(!readOnly) }}
              />
            </>
          }
        </ConfirmationDialog>
      </>
    );
  }
}
