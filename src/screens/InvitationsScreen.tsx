// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { List, Paragraph, IconButton } from "react-native-paper";

import { useSyncGate } from "../SyncGate";
import { useCredentials } from "../credentials";

import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import LoadingIndicator from "../widgets/LoadingIndicator";
import ConfirmationDialog from "../widgets/ConfirmationDialog";
import PrettyFingerprint from "../widgets/PrettyFingerprint";


async function loadInvitations(etebase: Etebase.Account) {
  const ret: Etebase.SignedInvitation[] = [];
  const invitationManager = etebase.getInvitationManager();

  let iterator: string | null = null;
  let done = false;
  while (!done) {
    const invitations = await invitationManager.listIncoming({ iterator, limit: 30 });
    iterator = invitations.iterator as string;
    done = invitations.done;

    ret.push(...invitations.data);
  }

  return ret;
}

export default function InvitationsScreen() {
  const [invitations, setInvitations] = React.useState<Etebase.SignedInvitation[]>();
  const [chosenInvitation, setChosenInvitation] = React.useState<Etebase.SignedInvitation>();
  const etebase = useCredentials()!;
  const syncGate = useSyncGate();

  React.useEffect(() => {
    loadInvitations(etebase).then(setInvitations);
  }, [etebase]);

  function removeInvitation(invite: Etebase.SignedInvitation) {
    setInvitations(invitations?.filter((x) => x.uid !== invite.uid));
  }

  async function reject(invite: Etebase.SignedInvitation) {
    const invitationManager = etebase.getInvitationManager();
    await invitationManager.reject(invite);
    removeInvitation(invite);
  }

  async function accept(invite: Etebase.SignedInvitation) {
    const invitationManager = etebase.getInvitationManager();
    await invitationManager.accept(invite);
    setChosenInvitation(undefined);
    removeInvitation(invite);
  }

  if (syncGate) {
    return syncGate;
  }

  return (
    <ScrollView>
      <Container>
        {invitations ?
          <>
            {(invitations.length > 0 ?
              invitations.map((invite) => (
                <List.Item
                  key={invite.uid}
                  title={`Invitation ${invite.fromUsername}`}
                  right={() => (
                    <>
                      <IconButton icon="close" onPress={() => { reject(invite) }} />
                      <IconButton icon="check" onPress={() => { setChosenInvitation(invite) }} />
                    </>
                  )}
                />
              ))
              :
              <List.Item
                title="No invitations"
              />
            )}
          </>
          :
          <LoadingIndicator />
        }
      </Container>
      {chosenInvitation && (
        <ConfirmationDialog
          title="Accept invitation"
          labelOk="OK"
          visible={!!chosenInvitation}
          onOk={() => accept(chosenInvitation)}
          onCancel={() => setChosenInvitation(undefined)}
        >
          <Paragraph>
            Please verify the inviter's security fingerprint to ensure the invitation is secure:
          </Paragraph>
          <PrettyFingerprint style={{ textAlign: "center" }} publicKey={chosenInvitation.fromPubkey} />
        </ConfirmationDialog>
      )}
    </ScrollView>
  );
}
